import styled from '@emotion/styled';
import { Button, Card, CardActions, CardContent, CircularProgress, Container, Grid, IconButton, Pagination, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import BottomNav from '../../components/BottomNav';
import CommonAppBar from '../../components/CommonAppBar';
import { format } from 'date-fns';
import AddReactionOutlinedIcon from '@mui/icons-material/AddReactionOutlined';
import InfoIcon from '@mui/icons-material/Info';
import ReplyIcon from '@mui/icons-material/Reply';
import SpecialStamp from './SpecialStamp';
import DetailDialog from './DetailDialog';
import { IWish } from '../../types/ticket';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReplyDialog from './ReplyDialog';
import ReactionsDialog from './ReactionsDialog';
import useWishContext from '../../hooks/useWishContext';
import useGlobalErrorContext from '../../hooks/useGlobalErrorContext';
import useCurrentUserRelationContext from '../../hooks/useCurrentUserRelationContext';
import useCurrentUserContext from '../../hooks/useCurrentUserContext';

const Wishes = () => {
    const [focusedWishId, setFocusedWishId] = useState<string | null>(null);
    const [targetPage, setTargetPage] = useState<number>();
    const [searchParams, setSearchParams] = useSearchParams();
    const { wishes, getWishes, currentPage, totalPageCount } = useWishContext();
    const { currentUserRelation } = useCurrentUserRelationContext();
    const { userRelations } = useCurrentUserContext();
    const { pushGlobalError, removeGlobalErrors } = useGlobalErrorContext();
    const selectedWishRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const isValidPageNumber = (pageQuery: number) => {
            if (isNaN(pageQuery) || pageQuery < 1 || !Number.isInteger(pageQuery)) {
                pushGlobalError({
                    message: 'URLクエリのpageは自然数にしてください。',
                    componentName: 'Wishes page',
                    methodName: 'useEffect',
                });
                return false;
            } else {
                removeGlobalErrors({ componentName: 'Wishes page' });
                return true;
            }
        };
        const wishId = searchParams.get('wishId');
        if (focusedWishId !== wishId) setFocusedWishId(wishId);
        const pageQuery = Number(searchParams.get('page') ?? 1);
        if (isValidPageNumber(pageQuery)) {
            if (pageQuery !== targetPage) setTargetPage(pageQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);
    useEffect(() => {
        if (targetPage === undefined) return;
        if (currentPage !== undefined && currentPage === targetPage) return;
        getWishes(currentUserRelation.id, targetPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, currentUserRelation.id, targetPage]);
    useEffect(() => {
        if (wishes === undefined) return;
        if (focusedWishId === null) return;
        if (selectedWishRef.current === null) return;
        window.scroll({ top: selectedWishRef.current.offsetTop - 50 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wishes, focusedWishId]);
    return (
        <>
            <CommonAppBar userRelations={userRelations} currentRelation={currentUserRelation} />
            <BottomNav userRelations={userRelations} />
            <main>
                <Container sx={{ py: 8 }} maxWidth="md">
                    {totalPageCount === undefined ? (
                        <CircularProgress />
                    ) : (
                        <Pagination
                            count={totalPageCount}
                            page={currentPage}
                            onChange={(_event, value) =>
                                setSearchParams(searchParams => {
                                    searchParams.set('page', String(value));
                                    return searchParams;
                                })
                            }
                            sx={{ py: 1 }}
                        />
                    )}
                    {wishes && (
                        <Grid container spacing={2}>
                            {wishes.map(wish => {
                                const isSelected = focusedWishId === wish.id;
                                return <WishItem key={wish.id} wish={wish} isSelected={isSelected} selectedRef={isSelected ? selectedWishRef : undefined} />;
                            })}
                        </Grid>
                    )}
                    {totalPageCount === undefined ? (
                        <CircularProgress />
                    ) : (
                        <Pagination
                            count={totalPageCount}
                            page={currentPage}
                            onChange={(_event, value) =>
                                setSearchParams(searchParams => {
                                    searchParams.set('page', String(value));
                                    return searchParams;
                                })
                            }
                            sx={{ py: 1 }}
                        />
                    )}
                </Container>
            </main>
        </>
    );
};

interface WishItemProps {
    wish: IWish;
    isSelected: boolean;
    selectedRef?: React.MutableRefObject<HTMLDivElement | null>;
}

const WishItem = ({ wish, isSelected, selectedRef }: WishItemProps) => {
    const [openedDialog, setOpenedDialog] = useState<'Detail' | 'Reply' | 'Reaction'>();
    const [, setSearchParams] = useSearchParams();
    const { currentUserRelation } = useCurrentUserRelationContext();
    const { me } = useCurrentUserContext();
    const { updateReactions } = useWishContext();
    const navigate = useNavigate();

    const getDialog = () => {
        switch (openedDialog) {
            case 'Detail':
                return (
                    <DetailDialog
                        me={me}
                        ticket={wish.ticket}
                        onClose={() => setOpenedDialog(undefined)}
                        relatedUserName={currentUserRelation.related_username}
                    />
                );
            case 'Reply':
                return <ReplyDialog wish={wish} currentRelation={currentUserRelation} onClose={() => setOpenedDialog(undefined)} />;
            case 'Reaction':
                return <ReactionsDialog wish={wish} currentRelation={currentUserRelation} onClose={() => setOpenedDialog(undefined)} />;
        }
    };

    return (
        <StyledGrid item xs={12} sm={6} md={4} ref={selectedRef}>
            <Card className={`card${isSelected ? ' card-selected' : ''}`}>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between">
                        {me !== undefined && (
                            <Typography className={`from-name${wish.ticket.is_special ? ' special-ticket' : ''}`}>
                                {wish.ticket.giving_user_id === me.id ? currentUserRelation.related_username : me.username}の
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
                                    updateReactions(currentUserRelation.id, wish.id, reactions.join('')).catch(_ => {});
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
                                    setSearchParams(searchParams => {
                                        searchParams.set('wishId', wish.id);
                                        return searchParams;
                                    });
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
                                setSearchParams(searchParams => {
                                    searchParams.set('wishId', wish.id);
                                    return searchParams;
                                });
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
                        onClick={() => navigate(`/user_relations/${currentUserRelation.id}/wishes/${wish.id}`)}
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
    .card-selected {
        border: 1px solid yellow;
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
