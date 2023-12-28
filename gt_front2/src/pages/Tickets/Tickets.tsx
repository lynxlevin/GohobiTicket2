import { useState } from 'react';
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

const availableTickets = [
    {
        "id": 1862,
        "user_relation": 1,
        "description": "いつもありがとうね。\n明日も楽しみ\n\n↑空行",
        "gift_date": "2023-12-28",
        "use_description": "",
        "use_date": null,
        "status": "draft",
        "is_special": false
    },
    {
        "id": 1861,
        "user_relation": 1,
        "description": "いつもありがとう。これは長い文章です。適切に折り返しされるでしょうか？",
        "gift_date": "2023-12-27",
        "use_description": "",
        "use_date": null,
        "status": "unread",
        "is_special": false
    },
    {
        "id": 1860,
        "user_relation": 1,
        "description": "マッサージありがとう",
        "gift_date": "2023-12-25",
        "use_description": "",
        "use_date": null,
        "status": "read",
        "is_special": true
    },
    {
        "id": 1859,
        "user_relation": 1,
        "description": "一緒に楽しい夜を過ごせた。",
        "gift_date": "2023-12-21",
        "use_description": "",
        "use_date": null,
        "status": "edited",
        "is_special": false
    },
];

const usedTickets = [
    {
        "id": 1858,
        "user_relation": 1,
        "description": "ありがとう。",
        "gift_date": "2023-12-20",
        "use_description": "",
        "use_date": "2023-12-25",
        "status": "read",
        "is_special": false
    },
    {
        "id": 1857,
        "user_relation": 1,
        "description": "マッサージありがとう",
        "gift_date": "2023-12-19",
        "use_description": "",
        "use_date": "2023-12-24",
        "status": "read",
        "is_special": true
    },
    {
        "id": 1856,
        "user_relation": 1,
        "description": "一緒に楽しい夜を過ごせた。",
        "gift_date": "2023-12-18",
        "use_description": "マッサージしてほしい",
        "use_date": "2023-12-23",
        "status": "read",
        "is_special": false
    },
];

// Copied template from https://github.com/mui/material-ui/tree/v5.15.2/docs/data/material/getting-started/templates/album
const Tickets = () => {
    return (
        <>
        <TicketAppBar />
        <main>
            {/* Hero unit */}
            <Box
            sx={{
                bgcolor: 'background.paper',
                pt: 8,
                pb: 6,
            }}
            >
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