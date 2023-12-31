import { useState, useEffect } from 'react';
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
import { Link } from 'react-router-dom';
import TicketAppBar from './TicketsAppBar';
import TicketForm from './TicketForm';
import Ticket from './Ticket';
import { ITicket, TicketAPI } from '../../apis/TicketAPI';
import useUserAPI from '../../hooks/useUserAPI';

// Copied template from https://github.com/mui/material-ui/tree/v5.15.2/docs/data/material/getting-started/templates/album
const Tickets = () => {
    const [availableTickets, setAvailableTickets] = useState<ITicket[]>([]);
    const [usedTickets, setUsedTickets] = useState<ITicket[]>([]);
    useUserAPI();

    useEffect(() => {
        const getTickets = async () => {
            const res = await TicketAPI.list(1);
            setAvailableTickets(res.data.available_tickets);
            setUsedTickets(res.data.used_tickets);
        }
        getTickets();
    }, []);


    return (
        <>
        <TicketAppBar />
        <main>
            {/* Hero unit */}
            <Box sx={{ pt: 8, pb: 6 }}>
                <Container maxWidth="sm">
                    <Typography variant="h5" align="center" color="text.primary" sx={{ mt: 3 }} gutterBottom>
                    ちひろにあげる
                    </Typography>
                    <Typography variant="h4" align="center" color="text.primary" sx={{ fontWeight: 600 }} gutterBottom>
                    ごほうびチケット
                    </Typography>
                    <CardMedia sx={{ pt: '60%', backgroundSize: 'contain' }} component="div" image="/IMG_5777.jpeg" />
                    {/* <CardMedia sx={{ pt: '60%', backgroundSize: 'contain' }} component="div" image="/IMG_5928.jpeg" /> */}
                    <Typography variant="h5" align="center" color="text.primary" gutterBottom>
                        計747枚
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