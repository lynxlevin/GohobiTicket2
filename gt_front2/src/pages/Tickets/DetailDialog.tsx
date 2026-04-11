import { Dialog, DialogContent, Typography } from '@mui/material';
import { format } from 'date-fns';
import useUserContext from '../../hooks/useUserContext';

interface TicketDetail {
    giving_user_id: number;
    gift_date: string;
    description: string;
}

interface DetailDialogProps {
    onClose: () => void;
    ticket: TicketDetail;
    relatedUserName: string;
}

const DetailDialog = (props: DetailDialogProps) => {
    const { onClose, ticket, relatedUserName } = props;
    const { me } = useUserContext();

    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogContent>
                {me !== undefined && <Typography textAlign="right">{ticket.giving_user_id === me.id ? me.username : relatedUserName}からのお礼</Typography>}
                <Typography textAlign="right">{format(new Date(ticket.gift_date), 'yyyy-MM-dd')}</Typography>
                <Typography mt={1} whiteSpace="pre-wrap">
                    {ticket.description}
                </Typography>
            </DialogContent>
        </Dialog>
    );
};

export default DetailDialog;
