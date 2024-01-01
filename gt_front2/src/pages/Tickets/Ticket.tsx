import { useState, useMemo, memo } from 'react';
import {
    Badge,
    Button,
    IconButton,
    Card,
    CardActions,
    CardContent,
    Grid,
    Typography,
} from '@mui/material';
import { format } from 'date-fns';
import SpecialStamp from './SpecialStamp';
import EditIcon from '@mui/icons-material/Edit';

const Ticket = (props: any) => {
    const { ticket, isUsed } = props;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const getStatusBadge = useMemo(() => {
        let text;
        switch (ticket.status) {
            case 'unread':
                text = 'NEW!!';
                break;
            case 'edited':
                text = 'EDITED!!';
                break;
            case 'draft':
                text = 'DRAFT';
                break;
        }
        return <Badge color='primary' badgeContent={text} sx={{display: 'block', mr: 3.5}} />
    }, [ticket.status])

    return (
        <Grid item xs={12} sm={6} md={4}>
            {ticket.status !== 'read' && getStatusBadge}
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <div style={{position: 'relative'}}>
                        <Typography gutterBottom variant="subtitle1" sx={{pt: 1, pb: 1}}>
                            {format(new Date(ticket.gift_date), 'yyyy-MM-dd E')}
                        </Typography>
                        {!isUsed && (
                            <IconButton sx={{ position: 'absolute', top: '-5px', right: '-4px' }} onClick={() => setIsEditModalOpen(true)} size='small'><EditIcon /></IconButton>
                        )}
                    </div>
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

export default memo(Ticket);