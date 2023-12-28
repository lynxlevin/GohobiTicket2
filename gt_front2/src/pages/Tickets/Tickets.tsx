import { useState } from 'react';
import {
    Button,
    Card,
    CardActions,
    CardContent,
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

const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9];

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
                    <Typography
                    variant="h5"
                    align="center"
                    color="text.primary"
                    sx={{ mt: 3 }}
                    gutterBottom
                    >
                    ちひろにあげる
                    </Typography>
                    <Typography
                    variant="h4"
                    align="center"
                    color="text.primary"
                    sx={{ fontWeight: 600 }}
                    gutterBottom
                    >
                    ごほうびチケット
                    </Typography>
                    <CardMedia sx={{ pt: '60%', backgroundSize: 'contain' }} component="div" image="/IMG_5777.jpeg" />
                    {/* <CardMedia sx={{ pt: '60%', backgroundSize: 'contain' }} component="div" image="/IMG_5928.jpeg" /> */}
                    <Typography
                    variant="h5"
                    align="center"
                    color="text.primary"
                    gutterBottom
                    >
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
                    {cards.map((card) => (
                    <Grid item key={card} xs={12} sm={6} md={4}>
                        <Card
                        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                        <CardMedia
                            component="div"
                            sx={{
                            // 16:9
                            pt: '56.25%',
                            }}
                            image="https://source.unsplash.com/random?wallpapers"
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Typography gutterBottom variant="h5" component="h2">
                            Heading
                            </Typography>
                            <Typography>
                            This is a media card. You can use this section to describe the
                            content.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small">View</Button>
                            <Button size="small">Edit</Button>
                        </CardActions>
                        </Card>
                    </Grid>
                    ))}
                </Grid>
            </Container>
        </main>
        </>
    );
}

export default Tickets;