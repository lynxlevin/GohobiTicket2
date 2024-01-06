import { Dialog, DialogContent, Typography } from '@mui/material';
import { format } from 'date-fns';
import { ITicket } from '../../contexts/ticket-context';

interface UseDetailDialogProps {
    onClose: () => void;
    ticket: ITicket;
}

const UseDetailDialog = (props: UseDetailDialogProps) => {
    const { onClose, ticket } = props;

    return (
        <Dialog open={true} onClose={onClose}>
            <DialogContent>
                <Typography gutterBottom variant='subtitle1' mt={1} mb={1}>
                    {format(new Date(ticket.gift_date), 'yyyy-MM-dd E')}
                </Typography>
                <Typography whiteSpace='pre-wrap'>{ticket.use_description}</Typography>
            </DialogContent>
        </Dialog>
    );
};

export default UseDetailDialog;
