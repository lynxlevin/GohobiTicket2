import { Button, Dialog, DialogActions, DialogContent, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useState } from 'react';
import { ITicket } from '../../contexts/ticket-context';
import useTicketContext from '../../hooks/useTicketContext';

interface UseDialogProps {
    onClose: () => void;
    ticket: ITicket;
}

const UseDialog = (props: UseDialogProps) => {
    const { onClose, ticket } = props;
    const [useDescription, setUseDescription] = useState('');
    const { consumeTicket } = useTicketContext();

    const handleSubmit = async () => {
        await consumeTicket(ticket.id, useDescription);
        onClose();
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogContent>
                <Typography gutterBottom variant='subtitle1'>
                    {format(new Date(ticket.gift_date), 'yyyy-MM-dd E')}
                </Typography>
                <Typography gutterBottom whiteSpace='pre-wrap'>
                    {ticket.description}
                </Typography>
                <Typography fontWeight={600} mt={2} gutterBottom>
                    このチケットを使って、なにをしてほしい？
                </Typography>
                <TextField value={useDescription} onChange={event => setUseDescription(event.target.value)} multiline fullWidth minRows={5} />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', py: 2 }}>
                <Button variant='contained' onClick={handleSubmit}>
                    チケットを使う
                </Button>
                <Button variant='outlined' onClick={onClose} sx={{ color: 'primary.dark' }}>
                    キャンセル
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UseDialog;
