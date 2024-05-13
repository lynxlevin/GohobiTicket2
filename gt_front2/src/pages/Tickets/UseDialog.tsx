import { Button, Dialog, DialogActions, DialogContent, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useContext, useState } from 'react';
import { ITicket } from '../../contexts/ticket-context';
import useTicketContext from '../../hooks/useTicketContext';
import { UserRelationContext } from '../../contexts/user-relation-context';
import { useSearchParams } from 'react-router-dom';

interface UseDialogProps {
    onClose: () => void;
    ticket: ITicket;
}

const UseDialog = (props: UseDialogProps) => {
    const { onClose, ticket } = props;
    const userRelationContext = useContext(UserRelationContext);
    const [useDescription, setUseDescription] = useState('');
    const { consumeTicket } = useTicketContext();
    const [searchParams] = useSearchParams();

    const handleSubmit = async () => {
        const userRelationId = Number(searchParams.get('user_relation_id'));
        const currentRelation = userRelationContext.userRelations.find(relation => Number(relation.id) === userRelationId)!;
        if (currentRelation.use_slack) {
            await consumeTicket(ticket.id, useDescription);
            onClose();
        } else {
            const text = ticket.is_special ? `〜★〜★〜★〜★〜★〜★〜★〜★\n${useDescription}\n★〜★〜★〜★〜★〜★〜★〜★〜` : `〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜\n${useDescription}\n〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜`;
            await navigator.share({text}).then(async () => {
                await consumeTicket(ticket.id, useDescription);
                onClose();
            }).catch(() => {
                // Suppress AbortError
            });
        }
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
