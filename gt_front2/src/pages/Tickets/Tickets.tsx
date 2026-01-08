import styled from '@emotion/styled';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import { Box, CardMedia, Container, FormControlLabel, FormGroup, Grid, IconButton, Paper, Switch, Typography } from '@mui/material';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import BottomNav from '../../BottomNav';
import { UserContext } from '../../contexts/user-context';
import { RelationKind } from '../../contexts/user-relation-context';
import useTicketContext from '../../hooks/useTicketContext';
import useUserAPI from '../../hooks/useUserAPI';
import Ticket from './Ticket';
import TicketForm from './TicketForm';
import TicketsAppBar from './TicketsAppBar';
import useUserRelationContext from '../../hooks/useUserRelationContext';

interface TicketsProps {
    relationKind: RelationKind;
}

// Copied template from https://github.com/mui/material-ui/tree/v5.15.2/docs/data/material/getting-started/templates/album
const Tickets = ({ relationKind }: TicketsProps) => {
    const userContext = useContext(UserContext);
    const lastAvailableTicketRef = useRef<HTMLDivElement | null>(null);

    const [showOnlySpecial, setShowOnlySpecial] = useState(false);
    const [showOnlyUsed, setShowOnlyUsed] = useState(false);
    const { handleLogout } = useUserAPI();
    const { userRelations } = useUserRelationContext();
    const { givingTickets, receivingTickets, getReceivingTickets, getGivingTickets, getSortedTickets, getLastAvailableTicketId } = useTicketContext();

    const pathParams = useParams();
    const userRelationId = Number(pathParams.userRelationId);
    const currentRelation = userRelations?.find(relation => Number(relation.id) === userRelationId);
    const imageFile = relationKind === 'Receiving' ? currentRelation?.receiving_ticket_img : currentRelation?.giving_ticket_img;

    const ticketImage = useMemo(() => {
        if (currentRelation === undefined) return '';

        if (imageFile === null)
            return (
                <Paper sx={{ py: '5%', my: '10px', color: '#565656', background: '#ffeaea', border: 'dashed 4px #ffc3c3', boxShadow: '0 0 0 10px #ffeaea' }}>
                    <Typography variant="h2">
                        Thank you
                        <br />
                        very much!!
                    </Typography>
                </Paper>
            );

        return <CardMedia sx={{ pt: '60%', backgroundSize: 'contain' }} component="div" image={`ticket_images/${imageFile}`} />;
    }, [currentRelation, imageFile]);

    const miniTicket = useMemo(() => {
        if (currentRelation === undefined) return '';

        if (imageFile === null)
            return <MiniTicket onClick={() => window.scroll({ top: 0, behavior: 'smooth' })} src="/apple-touch-icon.png" alt="mini-ticket" />;

        return <MiniTicket onClick={() => window.scroll({ top: 0, behavior: 'smooth' })} src={`ticket_images/${imageFile}`} alt="mini-ticket" />;
    }, [currentRelation, imageFile]);

    const tickets = relationKind === 'Receiving' ? receivingTickets : givingTickets;
    const ticketCount = tickets !== undefined ? tickets.length : 0;
    const isSpecialNumber = ticketCount > 0 && (ticketCount % 100 === 0 || ticketCount % 111 === 0 || ticketCount % 1111 === 0);

    useEffect(() => {
        if (userContext.isLoggedIn !== true || isNaN(userRelationId)) return;
        switch (relationKind) {
            case 'Receiving':
                if (receivingTickets !== undefined) return;
                getReceivingTickets(userRelationId);
                return;
            case 'Giving':
                if (givingTickets !== undefined) return;
                getGivingTickets(userRelationId);
                return;
        }
    }, [getGivingTickets, getReceivingTickets, givingTickets, receivingTickets, relationKind, userContext.isLoggedIn, userRelationId]);

    // MYMEMO: Change this like for LifeTracker
    if (userContext.isLoggedIn !== true || !currentRelation) return <Navigate to="/login" />;
    return (
        <>
            {/* MYMEMO: AppBar should be same as diaries */}
            <TicketsAppBar handleLogout={handleLogout} currentRelation={currentRelation} relationKind={relationKind} />
            <BottomNav />
            <main>
                <Box sx={{ pt: 8 }}>
                    <Container maxWidth="sm">
                        <Typography variant="h5" align="center" color="text.primary" sx={{ mt: 3 }} gutterBottom>
                            {currentRelation.related_username}に{relationKind === 'Receiving' ? 'もらった' : 'あげる'}
                        </Typography>
                        <Typography variant="h4" align="center" color="text.primary" sx={{ fontWeight: 600 }} gutterBottom>
                            ごほうびチケット
                        </Typography>
                        {isSpecialNumber ? (
                            <Typography variant="h5" align="center" color="text.primary" gutterBottom>
                                計<GoldNumber>{ticketCount}</GoldNumber>枚
                            </Typography>
                        ) : (
                            <Typography variant="h5" align="center" color="text.primary" gutterBottom>
                                計{ticketCount}枚
                            </Typography>
                        )}
                        {ticketImage}
                        {relationKind === 'Giving' && <TicketForm />}
                        <FormGroup>
                            <FormControlLabel label="特別チケットのみ表示" control={<Switch onChange={event => setShowOnlySpecial(event.target.checked)} />} />
                            <FormControlLabel label="使用済みチケットのみ表示" control={<Switch onChange={event => setShowOnlyUsed(event.target.checked)} />} />
                        </FormGroup>
                    </Container>
                </Box>
                <Container sx={{ pt: 4, pb: 4 }} maxWidth="md">
                    <Grid container spacing={4}>
                        {getSortedTickets({ showOnlySpecial, showOnlyUsed, relationKind }).map(ticket => {
                            if (ticket.id === getLastAvailableTicketId(relationKind)) {
                                return <Ticket key={ticket.id} lastAvailableTicketRef={lastAvailableTicketRef} ticket={ticket} relationKind={relationKind} />;
                            }
                            return <Ticket key={ticket.id} ticket={ticket} relationKind={relationKind} />;
                        })}
                    </Grid>
                </Container>
                {!showOnlyUsed && !showOnlySpecial && (
                    <ToLastAvailableTicketButton
                        onClick={() => {
                            if (lastAvailableTicketRef.current !== null) window.scrollTo({ top: lastAvailableTicketRef.current.offsetTop, behavior: 'smooth' });
                        }}
                    >
                        <KeyboardDoubleArrowDownIcon />
                    </ToLastAvailableTicketButton>
                )}
                {miniTicket}
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
    bottom: 66px;
    border: 2px solid #ddd;
    width: 40px;
    height: 40px;
    z-index: 100;
`;

const MiniTicket = styled.img`
    height: 50px;
    position: fixed;
    bottom: 64px;
    right: 13px;
    box-shadow:
        2px 2px 7px rgba(18, 47, 61, 0.5),
        -5px -5px 15px rgba(248, 253, 255, 0.9),
        inset 5px 5px 15px transparent,
        inset -5px -5px 15px transparent;
    z-index: 100;

    &:hover {
        opacity: 0.95;
        filter: brightness(105%);
    }
`;

const GoldNumber = styled.span`
    font-size: 2.5rem;
    padding: 8px;
    background: linear-gradient(to bottom, #cfc09f 27%, #ffecb3 40%, #3a2c0f 78%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: #fff;
    font-weight: bold;
`;

export default Tickets;
