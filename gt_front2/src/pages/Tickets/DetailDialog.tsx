import { Dialog, DialogContent, Typography } from '@mui/material';
import { format } from 'date-fns';
import { ITicket } from '../../contexts/ticket-context';

interface DetailDialogProps {
    onClose: () => void;
    ticket: ITicket;
    relatedUserName: string;
}

const DetailDialog = (props: DetailDialogProps) => {
    const { onClose, ticket, relatedUserName } = props;

    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogContent>
                {/* MYMEMO: user_id is hardcoded here. */}
                <Typography textAlign="right">{ticket.giving_user_id === 1 ? '自分' : relatedUserName}からのお礼</Typography>
                <Typography textAlign="right">{format(new Date(ticket.gift_date), 'yyyy-MM-dd')}</Typography>
                <Typography mt={1} whiteSpace="pre-wrap">
                    {ticket.description}
                </Typography>
            </DialogContent>
        </Dialog>
    );
};

export default DetailDialog;
