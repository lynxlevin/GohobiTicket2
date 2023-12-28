import { useState } from 'react';
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    Typography,
} from '@mui/material';
import { format } from 'date-fns';

const Ticket = (props: any) => {
    const { ticket, isUsed } = props;
    return (
        <Grid item xs={12} sm={6} md={4}>
            <Card
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
                <CardContent sx={{ flexGrow: 1 }}>
                    <Grid container>
                        <Grid xs={6}>
                            <Typography gutterBottom variant="subtitle1" sx={{textAlign: 'left', pl: 1}}>
                                {format(new Date(ticket.gift_date), 'yyyy-MM-dd E')}
                            </Typography>
                        </Grid>
                        {!isUsed && (
                            <Grid xs={6}>
                                <Button size="small">Edit</Button>
                                <Button size="small">Delete</Button>
                            </Grid>
                        )}
                    </Grid>
                    <Typography sx={{whiteSpace: 'pre-wrap', mt: 1}}>
                        {ticket.description}
                    </Typography>
                </CardContent>
                {isUsed && (
                    <CardActions sx={{justifyContent: 'center', mb: 1}}>
                        <Button variant="contained">このチケットを使う</Button>
                    </CardActions>
                )}
            </Card>
        </Grid>
    );
}

export default Ticket;