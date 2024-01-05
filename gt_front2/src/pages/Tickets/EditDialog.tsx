import { Button, Checkbox, Dialog, DialogActions, DialogContent, FormControlLabel, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { TicketAPI } from '../../apis/TicketAPI';
import { UserRelationAPI } from '../../apis/UserRelationAPI';
import { ITicket } from '../../contexts/ticket-context';

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

    // MYMEMO: runs twice on render
    useEffect(() => {
        const checkSpecialTicketAvailability = async (date: Date) => {
            const giftDate = new Date(ticket.gift_date);
            const payload = {
                userRelationId: ticket.user_relation_id,
                year: giftDate.getFullYear(),
                month: giftDate.getMonth() + 1,
            };
            const { data: available } = await UserRelationAPI.checkSpecialTicketAvailability(payload);
            setIsSpecialTicketAvailable(available);
        };
        checkSpecialTicketAvailability(new Date());
    }, [ticket.gift_date, ticket.user_relation_id]);

    const updateTicket = async () => {
        const payload = {
            description,
        };
        const res = await TicketAPI.update(ticket.id, payload);
        onClose();
        // updateTicketList(res.data.ticket);
    };

    return (
        <Dialog open={true} onClose={onClose}>
            <DialogContent>
                <Typography gutterBottom variant='subtitle1' className='ticket-date'>
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
                <Button variant='contained' onClick={updateTicket}>
                    修正する
                </Button>
                <Button variant='outlined' onClick={onClose} sx={{ color: 'primary.dark' }}>
                    キャンセル
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditDialog;
