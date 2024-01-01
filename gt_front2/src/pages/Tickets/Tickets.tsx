import { useState, useEffect, useContext, useCallback } from 'react';
import {
    CardMedia,
    Grid,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Box,
    Typography,
    Container,
} from '@mui/material';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import TicketAppBar from './TicketsAppBar';
import TicketForm from './TicketForm';
import Ticket from './Ticket';
import { ITicket, TicketAPI } from '../../apis/TicketAPI';
import useUserAPI from '../../hooks/useUserAPI';
import { UserContext } from '../../contexts/user-context';
import { UserRelationContext } from '../../contexts/user-relation-context';

// Copied template from https://github.com/mui/material-ui/tree/v5.15.2/docs/data/material/getting-started/templates/album
const Tickets = () => {
    const userContext = useContext(UserContext);
    const userRelationContext = useContext(UserRelationContext);

    const [availableTickets, setAvailableTickets] = useState<ITicket[]>([]);
    const [usedTickets, setUsedTickets] = useState<ITicket[]>([]);
    const { handleLogout } = useUserAPI();

    const [searchParams] = useSearchParams();
    const userRelationId = Number(searchParams.get('user_relation_id'));

    const currentRelation = userRelationContext.userRelations.find(relation => Number(relation.id) === userRelationId)!;

    const getTickets = useCallback(async () => {
        const res = await TicketAPI.list(userRelationId);
        setAvailableTickets(res.data.available_tickets);
        setUsedTickets(res.data.used_tickets);
    }, [userRelationId])

    useEffect(() => {
        // MYMEMO: Too slow rendering. https://blog.logrocket.com/render-large-lists-react-5-methods-examples/#react-viewport-list
        if (userContext.isLoggedIn === true && userRelationId > 0) getTickets();
    }, [getTickets, userContext.isLoggedIn, userRelationId]);


    if (userContext.isLoggedIn === false) {
        return <Navigate to="/login" />;
    }
    if (!currentRelation) return <></>
    return (
        <>
        <TicketAppBar getTickets={getTickets} handleLogout={handleLogout} currentRelation={currentRelation} />
        <main>
            {/* Hero unit */}
            <Box sx={{ pt: 8, pb: 6 }}>
                <Container maxWidth="sm">
                    <Typography variant="h5" align="center" color="text.primary" sx={{ mt: 3 }} gutterBottom>
                    {currentRelation.related_username}に{currentRelation.is_giving_relation ? 'あげる' : 'もらった'}
                    </Typography>
                    <Typography variant="h4" align="center" color="text.primary" sx={{ fontWeight: 600 }} gutterBottom>
                    ごほうびチケット
                    </Typography>
                    {/* TODO: チケット画像の配信方法 */}
                    <CardMedia sx={{ pt: '60%', backgroundSize: 'contain' }} component="div" image={currentRelation.ticket_image} />
                    <Typography variant="h5" align="center" color="text.primary" gutterBottom>
                        計{availableTickets.length + usedTickets.length}枚
                    </Typography>
                    <FormGroup>
                        <FormControlLabel label="特別チケットのみ表示" control={<Checkbox />} />
                        <FormControlLabel label="使用済みチケットのみ表示" control={<Checkbox />} />
                    </FormGroup>
                    <TicketForm />
                </Container>
            </Box>
            {/* End hero unit */}
            <Container sx={{ py: 8 }} maxWidth="md">
                <Grid container spacing={4}>
                    {availableTickets.map((ticket) => (
                        <Ticket key={ticket.id} ticket={ticket} isUsed={false} />
                    ))}
                    {usedTickets.map((ticket) => (
                        <Ticket key={ticket.id} ticket={ticket} isUsed={true} />
                    ))}
                </Grid>
            </Container>
        </main>
        </>
    );
}

export default Tickets;