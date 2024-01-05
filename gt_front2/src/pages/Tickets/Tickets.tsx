import { Box, CardMedia, Checkbox, Container, FormControlLabel, FormGroup, Grid, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { TicketAPI } from '../../apis/TicketAPI';
import { ITicket } from '../../contexts/ticket-context';
import { TicketContext } from '../../contexts/ticket-context';
import { UserContext } from '../../contexts/user-context';
import { UserRelationContext } from '../../contexts/user-relation-context';
import useUserAPI from '../../hooks/useUserAPI';
import Ticket from './Ticket';
import TicketForm from './TicketForm';
import TicketAppBar from './TicketsAppBar';

// Copied template from https://github.com/mui/material-ui/tree/v5.15.2/docs/data/material/getting-started/templates/album
const Tickets = () => {
    const userContext = useContext(UserContext);
    const userRelationContext = useContext(UserRelationContext);
    const ticketContext = useContext(TicketContext);

    const [showOnlySpecialTickets, setShowOnlySpecialTickets] = useState(false);
    const [showOnlyUsedTickets, setShowOnlyUsedTickets] = useState(false);
    const { handleLogout } = useUserAPI();

    const [searchParams] = useSearchParams();
    const userRelationId = Number(searchParams.get('user_relation_id'));

    const currentRelation = userRelationContext.userRelations.find(relation => Number(relation.id) === userRelationId)!;

    const getTickets = useCallback(async () => {
        const res = await TicketAPI.list(userRelationId);
        ticketContext.setTickets(res.data.tickets);
    }, [ticketContext, userRelationId]);

    const sortConditions = useCallback((a: ITicket, b: ITicket) => {
        const aIsNewer = a.gift_date > b.gift_date;
        const onlyAIsUsed = a.use_date !== null && b.use_date === null;
        const onlyBIsUsed = a.use_date === null && b.use_date !== null;

        if (onlyAIsUsed) return 1;
        if (onlyBIsUsed) return -1;
        return aIsNewer ? -1 : 1;
    }, []);

    const sortedAllTickets = useMemo(() => {
        return ticketContext.tickets
            .filter(ticket => !showOnlySpecialTickets || ticket.is_special)
            .filter(ticket => !showOnlyUsedTickets || ticket.use_date !== null)
            .sort(sortConditions);
    }, [showOnlySpecialTickets, showOnlyUsedTickets, sortConditions, ticketContext.tickets]);

    useEffect(() => {
        // MYMEMO: Too slow rendering. https://blog.logrocket.com/render-large-lists-react-5-methods-examples/#react-viewport-list
        if (userContext.isLoggedIn === true && userRelationId > 0) getTickets();
    }, [getTickets, userContext.isLoggedIn, userRelationId]);

    if (userContext.isLoggedIn === false) {
        return <Navigate to='/login' />;
    }
    if (!currentRelation) return <></>;
    return (
        <>
            <TicketAppBar getTickets={getTickets} handleLogout={handleLogout} currentRelation={currentRelation} />
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
                        {/* TODO: チケット画像の配信方法 */}
                        <CardMedia sx={{ pt: '60%', backgroundSize: 'contain' }} component='div' image={currentRelation.ticket_image} />
                        {currentRelation.is_giving_relation && (
                            <TicketForm userRelationId={userRelationId} setAllTickets={ticketContext.setTickets} sortConditions={sortConditions} />
                        )}
                        <FormGroup>
                            <FormControlLabel
                                label='特別チケットのみ表示'
                                control={<Checkbox onChange={event => setShowOnlySpecialTickets(event.target.checked)} />}
                            />
                            <FormControlLabel
                                label='使用済みチケットのみ表示'
                                control={<Checkbox onChange={event => setShowOnlyUsedTickets(event.target.checked)} />}
                            />
                        </FormGroup>
                    </Container>
                </Box>
                <Container sx={{ py: 8 }} maxWidth='md'>
                    <Grid container spacing={4}>
                        {sortedAllTickets.map(ticket => (
                            <Ticket key={ticket.id} ticket={ticket} isGivingRelation={currentRelation.is_giving_relation} />
                        ))}
                    </Grid>
                </Container>
            </main>
        </>
    );
};

export default Tickets;
