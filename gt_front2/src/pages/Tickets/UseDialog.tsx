import { Button, Dialog, DialogActions, DialogContent, Divider, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useState } from 'react';
import useTicketContext from '../../hooks/useTicketContext';
import useUserRelationContext from '../../hooks/useUserRelationContext';
import { ITicket } from '../../types/ticket';

interface UseDialogProps {
    onClose: () => void;
    ticket: ITicket;
}

const UseDialog = (props: UseDialogProps) => {
    const { onClose, ticket } = props;
    const [useDescription, setUseDescription] = useState('');
    const [status, setStatus] = useState<'Unused' | 'Used' | 'UsedButNotSent'>('Unused');

    const { userRelations } = useUserRelationContext();
    const { consumeTicket } = useTicketContext();

    const currentRelation = userRelations?.find(relation => Number(relation.id) === ticket.user_relation_id);
    const handleSubmit = async () => {
        if (currentRelation === undefined) return;
        const web_push_result = await consumeTicket(ticket.id, useDescription);
        switch (web_push_result) {
            case 'Sent':
                setStatus('Used');
                break;
            case 'NotSent':
                setStatus('UsedButNotSent');
        }
    };
    return status === 'Unused' ? (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogContent>
                <Typography fontWeight={600} mt={2} gutterBottom>
                    このチケットを使って、なにをしてほしい？
                </Typography>
                <TextField value={useDescription} onChange={event => setUseDescription(event.target.value)} multiline fullWidth minRows={5} />
                <Divider sx={{ my: 2 }} />
                <Typography fontWeight={600} mt={2} gutterBottom>
                    使う{ticket.is_special && '特別'}チケット
                </Typography>
                <Typography gutterBottom variant="subtitle1">
                    {format(new Date(ticket.gift_date), 'yyyy-MM-dd E')}
                </Typography>
                <Typography gutterBottom whiteSpace="pre-wrap">
                    {ticket.description}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', py: 2 }}>
                <Button variant="contained" onClick={handleSubmit} disabled={useDescription.trim().length < 1}>
                    チケットを使う
                </Button>
                <Button variant="outlined" onClick={onClose} sx={{ color: 'primary.dark' }}>
                    キャンセル
                </Button>
            </DialogActions>
        </Dialog>
    ) : (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogContent>
                <Typography fontWeight={600} mt={2} gutterBottom>
                    {status === 'Used' && `🎉${currentRelation?.related_username}さんにおねがいメッセージを送りました。`}
                    {status === 'UsedButNotSent' &&
                        `${currentRelation?.related_username}さんは通知機能をオンにしていません。チケットを使ったことを伝えましょう。`}
                </Typography>
                <Divider />
                <Typography fontWeight={600} mt={2} gutterBottom>
                    おねがい
                </Typography>
                <Typography gutterBottom whiteSpace="pre-wrap">
                    {useDescription}
                </Typography>
                {status === 'Used' && (
                    <>
                        <Divider />
                        <Typography fontWeight={600} mt={2} gutterBottom>
                            使ったチケット
                        </Typography>
                        <Typography gutterBottom variant="subtitle1">
                            {format(new Date(ticket.gift_date), 'yyyy-MM-dd E')}
                        </Typography>
                        <Typography gutterBottom whiteSpace="pre-wrap">
                            {ticket.description}
                        </Typography>
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', py: 2 }}>
                <Button variant="outlined" onClick={onClose} sx={{ color: 'primary.dark' }}>
                    閉じる
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UseDialog;
