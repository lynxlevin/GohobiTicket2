import { Button, Dialog, DialogActions, DialogContent, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { IWish, IWishWithReplies } from '../../types/ticket';
import { IUserRelation } from '../../types/user_relation';
import useWishContext from '../../hooks/useWishContext';

interface ReplyDialogProps {
    onClose: () => void;
    wish: IWish | IWishWithReplies;
    currentRelation: IUserRelation;
}

const ReplyDialog = ({ onClose, wish, currentRelation }: ReplyDialogProps) => {
    const [description, setDescription] = useState('');
    const { reply } = useWishContext();

    const handleSubmit = () => {
        reply(currentRelation.id, wish.id, description).then(_ => {
            onClose();
        });
    };
    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogContent>
                <Typography fontWeight={600} mt={2} gutterBottom>
                    返事・追伸
                </Typography>
                <TextField value={description} onChange={event => setDescription(event.target.value)} multiline fullWidth minRows={5} />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', py: 2 }}>
                <Button variant="contained" onClick={handleSubmit} disabled={description.trim().length < 1}>
                    送信
                </Button>
                <Button variant="outlined" onClick={onClose} sx={{ color: 'primary.dark' }}>
                    キャンセル
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReplyDialog;
