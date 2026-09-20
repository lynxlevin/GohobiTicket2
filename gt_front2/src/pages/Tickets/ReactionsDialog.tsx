import { Dialog, DialogContent } from '@mui/material';
import { IWish, IWishReply, IWishWithReplies } from '../../types/ticket';
import { IUserRelation } from '../../types/user_relation';
import EmojiPicker, { EmojiClickData, SuggestionMode } from 'emoji-picker-react';
import ja from 'emoji-picker-react/dist/data/emojis-ja';
import useWishContext from '../../hooks/useWishContext';

export interface IWishReplyWithWishId extends IWishReply {
    wishId: string;
}

interface ReactionsDialogProps {
    onClose: () => void;
    wish?: IWish | IWishWithReplies;
    wishReply?: IWishReplyWithWishId;
    currentRelation: IUserRelation;
}

const ReactionsDialog = ({ onClose, wish, wishReply, currentRelation }: ReactionsDialogProps) => {
    const { updateReactions, updateReplyReactions } = useWishContext();
    const addReaction = (e: EmojiClickData) => {
        if (wish !== undefined) {
            updateReactions(currentRelation.id, wish.id, wish.reactions + e.emoji)
                .then(_ => {
                    onClose();
                })
                .catch(_ => {});
        } else if (wishReply !== undefined) {
            updateReplyReactions(currentRelation.id, wishReply.id, wishReply.reactions + e.emoji, wishReply.wishId)
                .then(_ => {
                    onClose();
                })
                .catch(_ => {});
        }
    };
    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogContent>
                <EmojiPicker
                    width="100%"
                    skinTonesDisabled
                    lazyLoadEmojis
                    previewConfig={{ showPreview: false }}
                    suggestedEmojisMode={SuggestionMode.RECENT}
                    onEmojiClick={addReaction}
                    autoFocusSearch={false}
                    emojiData={ja}
                />
            </DialogContent>
        </Dialog>
    );
};

export default ReactionsDialog;
