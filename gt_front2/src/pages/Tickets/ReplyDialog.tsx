import { Button, Dialog, DialogActions, DialogContent, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { IWish } from '../../types/ticket';
import { WishAPI } from '../../apis/WishAPI';
import { IUserRelation } from '../../types/user_relation';

interface ReplyDialogProps {
    onClose: () => void;
    wish: IWish;
    currentRelation: IUserRelation;
    afterSubmit?: () => void;
}

const ReplyDialog = ({ onClose, wish, currentRelation, afterSubmit }: ReplyDialogProps) => {
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        WishAPI.reply(currentRelation.id, wish.id, description).then(_ => {
            afterSubmit && afterSubmit();
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
