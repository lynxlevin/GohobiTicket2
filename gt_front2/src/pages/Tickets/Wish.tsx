import { Box, Button, Card, CardActions, CardContent, CircularProgress, Container, Divider, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import BottomNav from '../../components/BottomNav';
import usePagePath from '../../hooks/usePagePath';
import CommonAppBar from '../../components/CommonAppBar';
import { format } from 'date-fns';
import SpecialStamp from './SpecialStamp';
import { IUserRelation } from '../../types/user_relation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import ReplyDialog from './ReplyDialog';
import useWishContext from '../../hooks/useWishContext';
import AddReactionOutlinedIcon from '@mui/icons-material/AddReactionOutlined';
import ReactionsDialog, { IWishReplyWithWishId } from './ReactionsDialog';
import useCurrentUserRelationContext from '../../hooks/useCurrentUserRelationContext';
import useCurrentUserContext from '../../hooks/useCurrentUserContext';

const Wish = () => {
    const [openedDialog, setOpenedDialog] = useState<'Reply' | 'Reaction'>();
    const { currentWish: wish, getCurrentWish, clearCurrentWish, updateReactions } = useWishContext();
    const { currentUserRelation } = useCurrentUserRelationContext();
    const { me, userRelations } = useCurrentUserContext();
    const { wishId } = usePagePath();
    const navigate = useNavigate();

    const getDialog = () => {
        if (wish === undefined) return undefined;
        switch (openedDialog) {
            case 'Reply':
                return <ReplyDialog wish={wish} currentRelation={currentUserRelation} onClose={() => setOpenedDialog(undefined)} />;
            case 'Reaction':
                return <ReactionsDialog wish={wish} currentRelation={currentUserRelation} onClose={() => setOpenedDialog(undefined)} />;
        }
    };

    const getRepliesUI = () => {
        if (wish === undefined) return <></>;
        let lastReplyDate = format(new Date(wish.created_at), 'yyyy-MM-dd');
        return wish.replies.map(reply => {
            const replyDate = format(new Date(reply.created_at), 'yyyy-MM-dd');
            const hideDate = lastReplyDate === replyDate;
            lastReplyDate = replyDate;
            return <Reply key={reply.id} reply={{ ...reply, wishId: wish.id }} currentUserRelation={currentUserRelation} hideDate={hideDate} />;
        });
    };

    useEffect(() => {
        if (wishId === null) return;
        if (wish !== undefined && wish.id === wishId) return;
        getCurrentWish(currentUserRelation.id, wishId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserRelation, wish, wishId]);
    return (
        <>
            <CommonAppBar
                userRelations={userRelations}
                currentRelation={currentUserRelation}
                leftItem={
                    wish ? (
                        <IconButton
                            onClick={() => {
                                clearCurrentWish();
                                navigate(`/user_relations/${currentUserRelation.id}/wishes?wishId=${wish.id}`);
                            }}
                        >
                            <ArrowBackIcon sx={{ color: 'rgba(0,0,0,0.67)' }} />
                        </IconButton>
                    ) : (
                        <></>
                    )
                }
            />
            <BottomNav userRelations={userRelations} />
            {wish === undefined ? (
                <CircularProgress />
            ) : (
                <main>
                    <Container sx={{ py: 8 }} maxWidth="md">
                        <Box>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography
                                            sx={
                                                wish.ticket.is_special
                                                    ? {
                                                          textAlign: 'left',
                                                          fontSize: '14px',
                                                          marginLeft: '54px',
                                                          marginBottom: '16px',
                                                      }
                                                    : {
                                                          textAlign: 'left',
                                                          fontSize: '14px',
                                                      }
                                            }
                                        >
                                            {wish.ticket.giving_user_id === me.id ? currentUserRelation.related_username : me.username}の
                                            {wish.ticket.is_special ? '特別な' : ''}お願い
                                        </Typography>
                                        <Typography sx={{ fontSize: '12px', lineHeight: '14px', whiteSpace: 'pre-line', textAlign: 'right' }}>
                                            {format(new Date(wish.created_at), 'yyyy-MM-dd HH:mm').replace(' ', '\n')}
                                        </Typography>
                                    </Stack>
                                    <Typography
                                        sx={{
                                            marginTop: '16px',
                                            textAlign: 'start',
                                            whiteSpace: 'pre-wrap',
                                            overflowWrap: 'anywhere',
                                        }}
                                    >
                                        {wish.description}
                                    </Typography>
                                    <Stack direction="row" mr="auto">
                                        {Array.from(wish.reactions).map((reaction, idx) => (
                                            <IconButton
                                                key={`${wish.id}-reaction-${idx}`}
                                                size="small"
                                                onClick={() => {
                                                    if (me === undefined || wish.ticket.giving_user_id !== me.id) return;
                                                    const reactions = Array.from(wish.reactions);
                                                    reactions.splice(idx, 1);
                                                    updateReactions(currentUserRelation.id, wish.id, reactions.join('')).catch(_ => {});
                                                }}
                                                sx={{ py: 0, px: '3px' }}
                                            >
                                                {reaction}
                                            </IconButton>
                                        ))}
                                        {me !== undefined && wish.ticket.giving_user_id === me.id && (
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setOpenedDialog('Reaction');
                                                }}
                                            >
                                                <AddReactionOutlinedIcon />
                                            </IconButton>
                                        )}
                                    </Stack>
                                </CardContent>
                                {wish.ticket.is_special && <SpecialStamp randKey={wish.ticket.id} />}
                                {getRepliesUI()}
                                <CardActions
                                    sx={{
                                        justifyContent: 'flex-end',
                                        marginTop: '-16px',
                                        marginBottom: '0px',
                                    }}
                                ></CardActions>
                            </Card>
                            <Button sx={{ mt: '16px', px: 6 }} variant="contained" onClick={() => setOpenedDialog('Reply')}>
                                メッセージを送る
                            </Button>
                        </Box>
                        {openedDialog && getDialog()}
                    </Container>
                </main>
            )}
        </>
    );
};

interface ReplyProps {
    reply: IWishReplyWithWishId;
    currentUserRelation: IUserRelation;
    hideDate: boolean;
}

const Reply = ({ reply, currentUserRelation, hideDate }: ReplyProps) => {
    const [openedDialog, setOpenedDialog] = useState<'Reaction'>();
    const { me } = useCurrentUserContext();
    const { updateReplyReactions } = useWishContext();
    const posterName = reply.posted_by_id === me.id ? me.username : currentUserRelation.related_username;

    const getDialog = () => {
        switch (openedDialog) {
            case 'Reaction':
                return <ReactionsDialog wishReply={reply} currentRelation={currentUserRelation} onClose={() => setOpenedDialog(undefined)} />;
        }
    };
    return (
        <>
            <Box position="relative">
                <Divider sx={{ mx: '12px' }} />
                <Box p="16px">
                    <Stack direction="row" justifyContent="space-between">
                        <Typography
                            sx={{
                                textAlign: 'left',
                                fontSize: '14px',
                            }}
                        >
                            {posterName}より
                        </Typography>
                        <Typography sx={{ fontSize: '12px', lineHeight: '14px', whiteSpace: 'pre-line', textAlign: 'right' }}>
                            {format(new Date(reply.created_at), hideDate ? 'HH:mm' : 'yyyy-MM-dd HH:mm').replace(' ', '\n')}
                        </Typography>
                    </Stack>
                    <Typography
                        sx={{
                            marginTop: '16px',
                            textAlign: 'start',
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'anywhere',
                        }}
                    >
                        {reply.description}
                    </Typography>
                    <Stack direction="row" mr="auto">
                        {Array.from(reply.reactions).map((reaction, idx) => (
                            <IconButton
                                key={`${reply.id}-reaction-${idx}`}
                                size="small"
                                onClick={() => {
                                    if (reply.posted_by_id === me.id) return;
                                    const reactions = Array.from(reply.reactions);
                                    reactions.splice(idx, 1);
                                    updateReplyReactions(currentUserRelation.id, reply.id, reactions.join(''), reply.wishId).catch(_ => {});
                                }}
                                sx={{ py: 0, px: '3px' }}
                            >
                                {reaction}
                            </IconButton>
                        ))}
                        {me !== undefined && reply.posted_by_id !== me.id && (
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setOpenedDialog('Reaction');
                                }}
                            >
                                <AddReactionOutlinedIcon />
                            </IconButton>
                        )}
                    </Stack>
                </Box>
                {openedDialog && getDialog()}
            </Box>
        </>
    );
};

export default Wish;
