import styled from '@emotion/styled';
import { Button, Card, CardActions, CardContent, CircularProgress, Container, Grid, IconButton, Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import BottomNav from '../../components/BottomNav';
import useUserAPI from '../../hooks/useUserAPI';
import useUserRelationContext from '../../hooks/useUserRelationContext';
import usePagePath from '../../hooks/usePagePath';
import CommonAppBar from '../../components/CommonAppBar';
import { format } from 'date-fns';
import InfoIcon from '@mui/icons-material/Info';
import ReplyIcon from '@mui/icons-material/Reply';
import SpecialStamp from './SpecialStamp';
import DetailDialog from './DetailDialog';
import useUserContext from '../../hooks/useUserContext';
import { IWish } from '../../types/ticket';
import { WishAPI } from '../../apis/WishAPI';
import { useSearchParams } from 'react-router-dom';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { IUserRelation } from '../../types/user_relation';
import ReplyDialog from './ReplyDialog';

const Wishes = () => {
    const [searchParams] = useSearchParams();
    const { handleLogout } = useUserAPI();
    const { me, getMe } = useUserContext();
    const { getUserRelations, userRelations } = useUserRelationContext();
    const { userRelationId } = usePagePath();
    const [wishes, setWishes] = useState<IWish[]>();
    const [wishIdQuery] = useState(searchParams.get('wishId'));
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
        WishAPI.list(currentRelation.id).then(res => setWishes(res.data));
    }, [currentRelation, wishes]);

    useEffect(() => {
        if (wishes === undefined) return;
        if (wishIdQuery === null) return;
        if (selectedWishRef.current === null) return;
        window.scroll({ top: selectedWishRef.current.getBoundingClientRect().top - 50 });
    }, [wishIdQuery, wishes]);

    return (
        <>
            <CommonAppBar handleLogout={handleLogout} currentRelation={currentRelation} />
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
                                            selectedRef={wishIdQuery === wish.id ? selectedWishRef : undefined}
                                            setWishes={setWishes}
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
    setWishes: Dispatch<SetStateAction<IWish[] | undefined>>;
}

const WishItem = ({ wish, currentRelation, selectedRef, setWishes }: WishItemProps) => {
    const [openedDialog, setOpenedDialog] = useState<'Detail' | 'Reply'>();
    const [, setSearchParams] = useSearchParams();
    const { me } = useUserContext();

    const getDialog = () => {
        switch (openedDialog) {
            case 'Detail':
                return <DetailDialog ticket={wish.ticket} onClose={() => setOpenedDialog(undefined)} relatedUserName={currentRelation.related_username} />;
            case 'Reply':
                return (
                    <ReplyDialog
                        wish={wish}
                        currentRelation={currentRelation}
                        onClose={() => setOpenedDialog(undefined)}
                        afterSubmit={() => {
                            setWishes(prev => {
                                if (prev === undefined) return undefined;
                                const toBe = [...prev];
                                const thisWish = toBe.find(w => w.id === wish.id);
                                if (thisWish !== undefined) thisWish.has_replies = true;
                                return toBe;
                            });
                        }}
                    />
                );
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
        margin-top: -16px;
        margin-bottom: 0px;
    }

    .open-thread-button {
        width: 147px;
        margin-bottom: 16px;
        margin-left: auto;
        margin-right: auto;
    }
`;

export default Wishes;
