import { Box, Button, Card, CardActions, CardContent, CircularProgress, Container, Divider, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import BottomNav from '../../components/BottomNav';
import useUserAPI from '../../hooks/useUserAPI';
import useUserRelationContext from '../../hooks/useUserRelationContext';
import usePagePath from '../../hooks/usePagePath';
import CommonAppBar from '../../components/CommonAppBar';
import { format } from 'date-fns';
import SpecialStamp from './SpecialStamp';
import useUserContext from '../../hooks/useUserContext';
import { IWishReply, IWishWithReplies } from '../../types/ticket';
import { WishAPI } from '../../apis/WishAPI';
import { IUserRelation } from '../../types/user_relation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import ReplyDialog from './ReplyDialog';

const Wish = () => {
    const [openedDialog, setOpenedDialog] = useState<'Reply'>();
    const { handleLogout } = useUserAPI();
    const { me, getMe } = useUserContext();
    const { getUserRelations, userRelations } = useUserRelationContext();
    const { userRelationId, wishId } = usePagePath();
    const [wish, setWish] = useState<IWishWithReplies>();
    const navigate = useNavigate();

    const currentRelation = userRelations?.find(relation => Number(relation.id) === userRelationId);

    const getDialog = () => {
        if (wish === undefined) return undefined;
        if (currentRelation === undefined) return undefined;
        switch (openedDialog) {
            case 'Reply':
                return (
                    <ReplyDialog
                        wish={wish}
                        currentRelation={currentRelation}
                        onClose={() => setOpenedDialog(undefined)}
                        afterSubmit={() => setWish(undefined)}
                    />
                );
        }
    };

    const getRepliesUI = () => {
        if (wish === undefined) return <></>;
        if (currentRelation === undefined) return <></>;
        let lastReplyDate = format(new Date(wish.created_at), 'yyyy-MM-dd');
        return wish.replies.map(reply => {
            const replyDate = format(new Date(reply.created_at), 'yyyy-MM-dd');
            const hideDate = lastReplyDate === replyDate;
            lastReplyDate = replyDate;
            return <Reply reply={reply} currentRelation={currentRelation} hideDate={hideDate} />;
        });
    };

    useEffect(() => {
        if (me === undefined) getMe();
    }, [getMe, me]);

    useEffect(() => {
        if (userRelations === undefined) getUserRelations();
    }, [getUserRelations, userRelations]);

    useEffect(() => {
        if (currentRelation === undefined) return;
        if (wishId === null) return;
        if (wish !== undefined) return;
        WishAPI.get(currentRelation.id, wishId).then(res => setWish(res.data));
    }, [currentRelation, wish, wishId]);
    return (
        <>
            <CommonAppBar
                handleLogout={handleLogout}
                currentRelation={currentRelation}
                leftItem={
                    currentRelation && wish ? (
                        <IconButton onClick={() => navigate(`/user_relations/${currentRelation.id}/wishes?wishId=${wish.id}`)}>
                            <ArrowBackIcon sx={{ color: 'rgba(0,0,0,0.67)' }} />
                        </IconButton>
                    ) : (
                        <></>
                    )
                }
            />
            <BottomNav />
            {currentRelation === undefined || wish === undefined || me === undefined ? (
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
                                            {wish.ticket.giving_user_id === me.id ? currentRelation.related_username : me.username}の
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
                                </CardContent>
                                {wish.ticket.is_special && <SpecialStamp randKey={wish.ticket.id} />}
                                {getRepliesUI()}
                                <CardActions
                                    sx={{
                                        justifyContent: 'flex-end',
                                        marginTop: '-16px',
                                        marginBottom: '0px',
                                    }}
                                >
                                    {/* <IconButton size="small" onClick={() => setOpenedDialog('Reply')}>
                        <ReplyIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => setOpenedDialog('Detail')}>
                        <InfoIcon />
                    </IconButton> */}
                                </CardActions>
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
    reply: IWishReply;
    currentRelation: IUserRelation;
    hideDate: boolean;
}

const Reply = ({ reply, currentRelation, hideDate }: ReplyProps) => {
    const { me } = useUserContext();
    const posterName = reply.posted_by_id === me?.id ? me.username : currentRelation.related_username;
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
                </Box>
            </Box>
        </>
    );
};

export default Wish;
