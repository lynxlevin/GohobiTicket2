import styled from '@emotion/styled';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import { Box, CardMedia, Container, FormControlLabel, FormGroup, Grid, IconButton, Switch, Typography } from '@mui/material';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { TicketContext } from '../../contexts/ticket-context';
import { UserContext } from '../../contexts/user-context';
import { UserRelationContext } from '../../contexts/user-relation-context';
import useTicketContext from '../../hooks/useTicketContext';
import useUserAPI from '../../hooks/useUserAPI';
import Ticket from './Ticket';
import TicketForm from './TicketForm';
import TicketsAppBar from './TicketsAppBar';

// Copied template from https://github.com/mui/material-ui/tree/v5.15.2/docs/data/material/getting-started/templates/album
const Tickets = () => {
    const userContext = useContext(UserContext);
    const userRelationContext = useContext(UserRelationContext);
    const ticketContext = useContext(TicketContext);
    const lastAvailableTicketRef = useRef<HTMLDivElement | null>(null);

    const [showOnlySpecial, setShowOnlySpecial] = useState(false);
    const [showOnlyUsed, setShowOnlyUsed] = useState(false);
    const { handleLogout } = useUserAPI();
    const { getTickets, getSortedTickets, lastAvailableTicketId } = useTicketContext();

    const [searchParams] = useSearchParams();
    const userRelationId = Number(searchParams.get('user_relation_id'));
    const currentRelation = userRelationContext.userRelations.find(relation => Number(relation.id) === userRelationId)!;

    const imageSrc = useMemo(() => {
        if (!currentRelation) return '';
        return `ticket_images/${currentRelation.ticket_image}`;
    }, [currentRelation]);

    useEffect(() => {
        // MYMEMO: Too slow rendering. https://blog.logrocket.com/render-large-lists-react-5-methods-examples/#react-viewport-list
        if (userContext.isLoggedIn === true && userRelationId > 0) getTickets(userRelationId);
    }, [getTickets, userContext.isLoggedIn, userRelationId]);

    if (userContext.isLoggedIn === false) {
        return <Navigate to='/login' />;
    }
    if (!currentRelation) return <></>;
    return (
        <>
            <TicketsAppBar handleLogout={handleLogout} currentRelation={currentRelation} />
            <main>
                <Box sx={{ pt: 8 }}>
                    <Container maxWidth='sm'>
                        <Typography variant='h5' align='center' color='text.primary' sx={{ mt: 3 }} gutterBottom>
                            {currentRelation.related_username}に{currentRelation.is_giving_relation ? 'あげる' : 'もらった'}
                        </Typography>
                        <Typography variant='h4' align='center' color='text.primary' sx={{ fontWeight: 600 }} gutterBottom>
                            ごほうびチケット
                        </Typography>
                        <Typography variant='h5' align='center' color='text.primary' gutterBottom>
                            計{ticketContext.tickets.length}枚
                        </Typography>
                        <CardMedia sx={{ pt: '60%', backgroundSize: 'contain' }} component='div' image={imageSrc} />
                        {currentRelation.is_giving_relation && <TicketForm userRelationId={userRelationId} />}
                        <FormGroup>
                            <FormControlLabel label='特別チケットのみ表示' control={<Switch onChange={event => setShowOnlySpecial(event.target.checked)} />} />
                            <FormControlLabel label='使用済みチケットのみ表示' control={<Switch onChange={event => setShowOnlyUsed(event.target.checked)} />} />
                        </FormGroup>
                    </Container>
                </Box>
                <Container sx={{ pt: 4, pb: 4 }} maxWidth='md'>
                    <Grid container spacing={4}>
                        {getSortedTickets({ showOnlySpecial, showOnlyUsed }).map(ticket => {
                            if (ticket.id === lastAvailableTicketId) {
                                return (
                                    <Ticket
                                        key={ticket.id}
                                        lastAvailableTicketRef={lastAvailableTicketRef}
                                        ticket={ticket}
                                        isGivingRelation={currentRelation.is_giving_relation}
                                    />
                                );
                            }
                            return <Ticket key={ticket.id} ticket={ticket} isGivingRelation={currentRelation.is_giving_relation} />;
                        })}
                    </Grid>
                </Container>
                {!showOnlyUsed && (
                    <ToLastAvailableTicketButton
                        onClick={() => {
                            if (lastAvailableTicketRef.current !== null) window.scrollTo({ top: lastAvailableTicketRef.current.offsetTop, behavior: 'smooth' });
                        }}
                    >
                        <KeyboardDoubleArrowDownIcon />
                    </ToLastAvailableTicketButton>
                )}
                <MiniTicket onClick={() => window.scroll({ top: 0, behavior: 'smooth' })} src={imageSrc} alt='mini-ticket' />
            </main>
        </>
    );
};

const ToLastAvailableTicketButton = styled(IconButton)`
    font-size: 30px;
    background: white !important;
    border-radius: 999px;
    position: fixed;
    left: 16px;
    bottom: 20px;
    border: 2px solid #ddd;
    width: 40px;
    height: 40px;
    z-index: 100;
`;

const MiniTicket = styled.img`
    height: 50px;
    position: fixed;
    bottom: 13px;
    right: 13px;
    box-shadow: 2px 2px 7px rgba(18, 47, 61, 0.5), -5px -5px 15px rgba(248, 253, 255, 0.9), inset 5px 5px 15px transparent, inset -5px -5px 15px transparent;
    z-index: 100;

    &:hover {
        opacity: 0.95;
        filter: brightness(105%);
    }
`;

export default Tickets;
