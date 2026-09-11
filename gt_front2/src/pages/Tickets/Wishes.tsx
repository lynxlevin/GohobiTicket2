import styled from '@emotion/styled';
import { Button, Card, CardActions, CardContent, CircularProgress, Container, Grid, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import BottomNav from '../../components/BottomNav';
import useUserRelationContext from '../../hooks/useUserRelationContext';
import usePagePath from '../../hooks/usePagePath';
import CommonAppBar from '../../components/CommonAppBar';
import { format } from 'date-fns';
import AddReactionOutlinedIcon from '@mui/icons-material/AddReactionOutlined';
import InfoIcon from '@mui/icons-material/Info';
import ReplyIcon from '@mui/icons-material/Reply';
import SpecialStamp from './SpecialStamp';
import DetailDialog from './DetailDialog';
import useUserContext from '../../hooks/useUserContext';
import { IWish } from '../../types/ticket';
import { useNavigate, useSearchParams } from 'react-router-dom';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { IUserRelation } from '../../types/user_relation';
import ReplyDialog from './ReplyDialog';
import ReactionsDialog from './ReactionsDialog';
import useWishContext from '../../hooks/useWishContext';

const Wishes = () => {
    const [searchParams] = useSearchParams();
    const { wishes, getWishes } = useWishContext();
    const { me, getMe } = useUserContext();
    const { getUserRelations, userRelations } = useUserRelationContext();
    const { userRelationId } = usePagePath();
    const selectedWishRef = useRef<HTMLDivElement | null>(null);

    const currentRelation = userRelations?.find(relation => Number(relation.id) === userRelationId);

    useEffect(() => {
        if (me === undefined) getMe();
    }, [getMe, me]);

    useEffect(() => {
        if (userRelations === undefined) getUserRelations();
    }, [getUserRelations, userRelations]);

    useEffect(() => {
        if (currentRelation === undefined) return;
        if (wishes !== undefined) return;
        getWishes(currentRelation.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRelation, wishes]);

    useEffect(() => {
        if (wishes === undefined) return;
        if (searchParams.get('wishId') === null) return;
        if (selectedWishRef.current === null) return;
        window.scroll({ top: selectedWishRef.current.offsetTop - 50 });
    }, [searchParams, wishes]);

    return (
        <>
            <CommonAppBar currentRelation={currentRelation} />
            <BottomNav />
            {currentRelation === undefined ? (
                <CircularProgress />
            ) : (
                <main>
                    <Container sx={{ py: 8 }} maxWidth="md">
                        {wishes && (
                            <Grid container spacing={2}>
                                {wishes.map(wish => {
                                    return (
                                        <WishItem
                                            key={wish.id}
                                            wish={wish}
                                            currentRelation={currentRelation}
                                            selectedRef={searchParams.get('wishId') === wish.id ? selectedWishRef : undefined}
                                        />
                                    );
                                })}
                            </Grid>
                        )}
                    </Container>

                    <ToTopButton onClick={() => window.scroll({ top: 0, behavior: 'smooth' })}>
                        <KeyboardDoubleArrowUpIcon />
                    </ToTopButton>
                </main>
            )}
        </>
    );
};

const ToTopButton = styled(IconButton)`
    font-size: 30px;
    background: white !important;
    border-radius: 999px;
    position: fixed;
    right: 16px;
    bottom: 66px;
    border: 2px solid #ddd;
    width: 40px;
    height: 40px;
    z-index: 100;
`;

interface WishItemProps {
    wish: IWish;
    currentRelation: IUserRelation;
    selectedRef?: React.MutableRefObject<HTMLDivElement | null>;
}

const WishItem = ({ wish, currentRelation, selectedRef }: WishItemProps) => {
    const [openedDialog, setOpenedDialog] = useState<'Detail' | 'Reply' | 'Reaction'>();
    const [, setSearchParams] = useSearchParams();
    const { me } = useUserContext();
    const { updateReactions } = useWishContext();
    const navigate = useNavigate();

    const getDialog = () => {
        switch (openedDialog) {
            case 'Detail':
                return <DetailDialog ticket={wish.ticket} onClose={() => setOpenedDialog(undefined)} relatedUserName={currentRelation.related_username} />;
            case 'Reply':
                return <ReplyDialog wish={wish} currentRelation={currentRelation} onClose={() => setOpenedDialog(undefined)} />;
            case 'Reaction':
                return <ReactionsDialog wish={wish} currentRelation={currentRelation} onClose={() => setOpenedDialog(undefined)} />;
        }
    };

    return (
        <StyledGrid item xs={12} sm={6} md={4} ref={selectedRef}>
            <Card className="card">
                <CardContent>
                    <Stack direction="row" justifyContent="space-between">
                        {me !== undefined && (
                            <Typography className={`from-name${wish.ticket.is_special ? ' special-ticket' : ''}`}>
                                {wish.ticket.giving_user_id === me.id ? currentRelation.related_username : me.username}の
                                {wish.ticket.is_special ? '特別な' : ''}お願い
                            </Typography>
                        )}
                        <Typography className="post-time">{format(new Date(wish.created_at), 'yyyy-MM-dd HH:mm').replace(' ', '\n')}</Typography>
                    </Stack>
                    <Typography className="text">{wish.description}</Typography>
                </CardContent>
                <CardActions className="card-actions">
                    <Stack direction="row" mr="auto">
                        {Array.from(wish.reactions).map((reaction, idx) => (
                            <IconButton
                                key={`${wish.id}-reaction-${idx}`}
                                size="small"
                                onClick={() => {
                                    if (me === undefined || wish.ticket.giving_user_id !== me.id) return;
                                    const reactions = Array.from(wish.reactions);
                                    reactions.splice(idx, 1);
                                    updateReactions(currentRelation.id, wish.id, reactions.join(''));
                                }}
                                className="reaction"
                            >
                                {reaction}
                            </IconButton>
                        ))}
                        {me !== undefined && wish.ticket.giving_user_id === me.id && (
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setSearchParams({ wishId: wish.id });
                                    setOpenedDialog('Reaction');
                                }}
                            >
                                <AddReactionOutlinedIcon />
                            </IconButton>
                        )}
                    </Stack>
                    {!wish.has_replies && (
                        <IconButton
                            size="small"
                            onClick={() => {
                                setSearchParams({ wishId: wish.id });
                                setOpenedDialog('Reply');
                            }}
                        >
                            <ReplyIcon />
                        </IconButton>
                    )}
                    <IconButton size="small" onClick={() => setOpenedDialog('Detail')}>
                        <InfoIcon />
                    </IconButton>
                </CardActions>
                {wish.ticket.is_special && <SpecialStamp randKey={wish.ticket.id} />}
                {wish.has_replies && (
                    <Button
                        className="open-thread-button"
                        variant="outlined"
                        onClick={() => navigate(`/user_relations/${currentRelation.id}/wishes/${wish.id}`)}
                    >
                        スレッドを開く
                    </Button>
                )}
            </Card>
            {openedDialog && getDialog()}
        </StyledGrid>
    );
};

const StyledGrid = styled(Grid)`
    .card {
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
    }

    .from-name {
        text-align: left;
        font-size: 14px;
    }
    .special-ticket {
        margin-left: 54px;
        margin-bottom: 16px;
    }

    .post-time {
        font-size: 12px;
        line-height: 14px;
        white-space: pre-line;
        text-align: right;
    }

    .text {
        margin-top: 16px;
        text-align: start;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
    }
    .line-clamp {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        white-space: collapse;
    }

    .card-actions {
        justify-content: flex-end;
        margin-bottom: 0px;
    }

    .reaction {
        padding-top: 0px;
        padding-bottom: 0px;
        padding-right: 3px;
        padding-left: 3px;
    }

    .open-thread-button {
        width: 147px;
        margin-bottom: 16px;
        margin-left: auto;
        margin-right: auto;
    }
`;

export default Wishes;
