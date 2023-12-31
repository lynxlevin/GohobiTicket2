import { useState } from 'react';
import {
    Badge,
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    Typography,
} from '@mui/material';
import { format } from 'date-fns';
import SpecialStamp from './SpecialStamp';

const Ticket = (props: any) => {
    const { ticket, isUsed } = props;
    return (
        <Grid item xs={12} sm={6} md={4}>
            <Badge color='primary' badgeContent='NEW!!' sx={{display: 'block', mr: 3.5}} />
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Grid container>
                        <Grid item xs={12}>
                            <Typography gutterBottom variant="subtitle1" sx={{pt: 1, pb: 1}}>
                                {format(new Date(ticket.gift_date), 'yyyy-MM-dd E')}
                            </Typography>
                        </Grid>
                        {!isUsed && (
                            <Grid item xs={6}>
                                <Button size="small">Edit</Button>
                                <Button size="small">Delete</Button>
                            </Grid>
                        )}
                    </Grid>
                    <Typography sx={{whiteSpace: 'pre-wrap', mb: 2}}>
                        {ticket.description}
                    </Typography>
                </CardContent>
                {isUsed && (
                    <CardActions sx={{justifyContent: 'center', mb: 1}}>
                        <Button variant="contained">このチケットを使う</Button>
                    </CardActions>
                )}
                {ticket.is_special && <SpecialStamp randKey={ticket.id} />}
            </Card>
        </Grid>
    );
}

export default Ticket;