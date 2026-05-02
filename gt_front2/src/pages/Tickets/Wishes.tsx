import styled from '@emotion/styled';
import { Box, Button, Card, CardActions, CardContent, CircularProgress, Container, Divider, Grid, IconButton, Stack, Switch, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import BottomNav from '../../components/BottomNav';
import useUserAPI from '../../hooks/useUserAPI';
import useUserRelationContext from '../../hooks/useUserRelationContext';
import usePagePath from '../../hooks/usePagePath';
import CommonAppBar from '../../components/CommonAppBar';
import { format } from 'date-fns';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import SpecialStamp from './SpecialStamp';
import DetailDialog from './DetailDialog';
import useUserContext from '../../hooks/useUserContext';
import { IWish } from '../../types/ticket';
import { WishAPI } from '../../apis/WishAPI';
import { useSearchParams } from 'react-router-dom';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

const Wishes = () => {
    const [searchParams] = useSearchParams();
    const { handleLogout } = useUserAPI();
    const { me, getMe } = useUserContext();
    const { getUserRelations, userRelations } = useUserRelationContext();
    const { userRelationId } = usePagePath();
    const [showThreads, setShowThreads] = useState(false);
    const [wishIdToShowAll, setWishIdToShowAll] = useState<string>('');
    const [wishes, setWishes] = useState<IWish[]>();
    const [selectedWishId] = useState(searchParams.get('wish_id'));
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
        if (selectedWishId === null) return;
        selectedWishRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedWishId, wishes]);

    return (
        <>
            <CommonAppBar handleLogout={handleLogout} currentRelation={currentRelation} />
            <BottomNav />
            {currentRelation === undefined ? (
                <CircularProgress />
            ) : (
                <main>
                    <Container sx={{ py: 8 }} maxWidth="md">
                        {/* MYMEMO: スレッド機能搭載後条件を外す */}
                        {me?.id === 1 && (
                            <>
                                <Switch checked={showThreads} onChange={e => setShowThreads(e.target.checked)} />
                                スレッド表示
                            </>
                        )}
                        {wishes && (
                            <Grid container spacing={2}>
                                {wishes.map(wish => {
                                    return (
                                        <WishItem
                                            key={wish.id}
                                            wish={wish}
                                            relatedUserName={currentRelation.related_username}
                                            // MYMEMO: スレッド機能搭載後条件を外す
                                            hasThreadPosts={me?.id === 1 && showThreads}
                                            showAll={wishIdToShowAll === wish.id}
                                            setShowAll={() => setWishIdToShowAll(wish.id)}
                                            selectedRef={selectedWishId === wish.id ? selectedWishRef : undefined}
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
    relatedUserName: string;
    hasThreadPosts?: boolean;
    showAll?: boolean;
    setShowAll: () => void;
    selectedRef?: React.MutableRefObject<HTMLDivElement | null>;
}

const WishItem = ({ wish, relatedUserName, hasThreadPosts = true, showAll = false, setShowAll, selectedRef }: WishItemProps) => {
    const [openedDialog, setOpenedDialog] = useState<'Detail'>();
    const { me } = useUserContext();

    const getDialog = () => {
        switch (openedDialog) {
            case 'Detail':
                return <DetailDialog ticket={wish.ticket} onClose={() => setOpenedDialog(undefined)} relatedUserName={relatedUserName} />;
        }
    };

    return (
        <StyledGrid item xs={12} sm={6} md={4} ref={selectedRef}>
            <Card className="card">
                <CardContent>
                    <Stack direction="row" justifyContent="space-between">
                        {me !== undefined && (
                            <Typography className={`from-name${wish.ticket.is_special ? ' special-ticket' : ''}`}>
                                {wish.ticket.giving_user_id === me.id ? relatedUserName : me.username}より
                            </Typography>
                        )}
                        <Typography className="post-time">{format(new Date(wish.created_at), 'yyyy-MM-dd HH:mm')}</Typography>
                    </Stack>
                    <Typography className="text">{wish.description}</Typography>
                </CardContent>
                <CardActions className="card-actions">
                    <IconButton size="small" onClick={() => setOpenedDialog('Detail')}>
                        <InfoIcon />
                    </IconButton>
                    {/* <IconButton size="small">
                        <EditIcon />
                    </IconButton> */}
                </CardActions>
                {wish.ticket.is_special && <SpecialStamp randKey={wish.ticket.id} />}
                {hasThreadPosts && (
                    <>
                        <ThreadPost relatedUserName={relatedUserName} showAll={showAll} />
                        {showAll && <ThreadPost relatedUserName={relatedUserName} showAll={showAll} isLast />}
                    </>
                )}
                {hasThreadPosts && !showAll && (
                    <Button className="open-thread-button" variant="outlined" onClick={setShowAll}>
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
        line-height: 21px;
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

interface ThreadPostProps {
    relatedUserName: string;
    showAll?: boolean;
    isLast?: boolean;
}

const ThreadPost = ({ relatedUserName, showAll = false, isLast = false }: ThreadPostProps) => {
    return (
        <StyledPost>
            <Divider className="divider" />
            <Box className="content">
                <Stack direction="row" justifyContent="space-between">
                    <Typography className="from-name">{relatedUserName}より</Typography>
                    <Typography className="post-time">2025-08-18 13:15</Typography>
                </Stack>
                <Typography className={`text${showAll ? '' : ' line-clamp'}`}>
                    あいうえおあいうえおあいうえおあいうえおあいうえおあいうえおあいうえおあいうえおあいうえおあいうえおあいうえお
                </Typography>
                {showAll && (
                    <IconButton size="small" className={`edit-button${isLast ? ' is-last' : ''}`}>
                        <EditIcon />
                    </IconButton>
                )}
                {isLast && <Button className="message-button">メッセージを送る</Button>}
            </Box>
        </StyledPost>
    );
};

const StyledPost = styled(Box)`
    position: relative;

    .divider {
        margin-left: 12px;
        margin-right: 12px;
    }

    .content {
        padding: 16px;
    }

    .edit-button {
        position: absolute;
        bottom: 8px;
        right: 8px;
    }
    .is-last {
        bottom: 60px;
    }

    .message-button {
        margin-top: 16px;
    }
`;

export default Wishes;
