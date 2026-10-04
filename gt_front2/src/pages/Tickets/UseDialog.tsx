import { Button, Dialog, DialogActions, DialogContent, Divider, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useState } from 'react';
import useTicketContext from '../../hooks/useTicketContext';
import { ITicket } from '../../types/ticket';
import { IUserRelation } from '../../types/user_relation';

interface UseDialogProps {
    onClose: () => void;
    ticket: ITicket;
    currentUserRelation: IUserRelation;
}

const UseDialog = (props: UseDialogProps) => {
    const { onClose, ticket, currentUserRelation } = props;
    const [useDescription, setUseDescription] = useState('');
    const [status, setStatus] = useState<'Unused' | 'Used' | 'UsedButNotSent'>('Unused');

    const { consumeTicket } = useTicketContext();

    const handleSubmit = async () => {
        consumeTicket(ticket.id, useDescription)
            .then(webPushResult => {
                switch (webPushResult) {
                    case 'Sent':
                        setStatus('Used');
                        break;
                    case 'NotSent':
                        setStatus('UsedButNotSent');
                }
            })
            .catch(_ => {});
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
                    {status === 'Used' && `🎉${currentUserRelation.related_username}さんにおねがいメッセージを送りました。`}
                    {status === 'UsedButNotSent' &&
                        `${currentUserRelation.related_username}さんは通知機能をオンにしていません。チケットを使ったことを伝えましょう。`}
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
