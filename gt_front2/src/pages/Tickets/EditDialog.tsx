import { Button, Checkbox, Dialog, DialogActions, DialogContent, FormControlLabel, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { UserRelationAPI } from '../../apis/UserRelationAPI';
import { ITicket } from '../../contexts/ticket-context';
import useTicketContext from '../../hooks/useTicketContext';

interface EditDialogProps {
    onClose: () => void;
    ticket: ITicket;
}

const EditDialog = (props: EditDialogProps) => {
    const { onClose, ticket } = props;
    const [description, setDescription] = useState(ticket.description);
    const [isSpecial, setIsSpecial] = useState(false);
    const [isSpecialTicketAvailable, setIsSpecialTicketAvailable] = useState(false);
    const [willFinalize, setWillFinalize] = useState(false);
    const [willDelete, setWillDelete] = useState(false);
    const { updateTicket, deleteTicket } = useTicketContext();

    // MYMEMO: runs twice on render
    useEffect(() => {
        const checkSpecialTicketAvailability = async () => {
            const giftDate = new Date(ticket.gift_date);
            const payload = {
                userRelationId: ticket.user_relation_id,
                year: giftDate.getFullYear(),
                month: giftDate.getMonth() + 1,
            };
            const { data: available } = await UserRelationAPI.checkSpecialTicketAvailability(payload);
            setIsSpecialTicketAvailable(available);
        };
        checkSpecialTicketAvailability();
    }, [ticket.gift_date, ticket.user_relation_id]);

    const handleSubmit = async () => {
        await updateTicket(ticket.id, description, willFinalize);
        onClose();
    };

    return (
        <Dialog open={true} onClose={onClose}>
            <DialogContent>
                <FormControlLabel label='削除' control={<Checkbox checked={willDelete} onChange={event => setWillDelete(event.target.checked)} />} />
                <Typography gutterBottom variant='subtitle1'>
                    {format(new Date(ticket.gift_date), 'yyyy-MM-dd E')}
                </Typography>
                <TextField value={description} onChange={event => setDescription(event.target.value)} label='内容' multiline fullWidth minRows={5} />
                {ticket.status === 'draft' && (
                    <>
                        <FormControlLabel
                            disabled={!isSpecialTicketAvailable}
                            label='特別チケットにする'
                            control={<Checkbox checked={isSpecial} onChange={event => setIsSpecial(event.target.checked)} />}
                        />
                        <FormControlLabel
                            label='下書きを確定する'
                            control={<Checkbox checked={willFinalize} onChange={event => setWillFinalize(event.target.checked)} />}
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', paddingBottom: 3 }}>
                {willDelete ? (
                    <Button variant='contained' color='error' onClick={() => deleteTicket(ticket.id)}>
                        削除する
                    </Button>
                ) : (
                    <>
                        <Button variant='contained' onClick={handleSubmit}>
                            修正する
                        </Button>
                        <Button variant='outlined' onClick={onClose} sx={{ color: 'primary.dark' }}>
                            キャンセル
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default EditDialog;
