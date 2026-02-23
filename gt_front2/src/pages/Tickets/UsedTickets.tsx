import styled from '@emotion/styled';
import { Box, Button, Card, CardActions, CardContent, Container, Divider, Grid, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import BottomNav from '../../components/BottomNav';
import useTicketContext from '../../hooks/useTicketContext';
import useUserAPI from '../../hooks/useUserAPI';
import useUserRelationContext from '../../hooks/useUserRelationContext';
import usePagePath from '../../hooks/usePagePath';
import CommonAppBar from '../../components/CommonAppBar';
import { Navigate } from 'react-router-dom';
import { ITicket } from '../../contexts/ticket-context';
import { format } from 'date-fns';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import SpecialStamp from './SpecialStamp';
import DetailDialog from './DetailDialog';

const UsedTickets = () => {
    const { handleLogout } = useUserAPI();
    const { getUserRelations, userRelations } = useUserRelationContext();
    const { givingTickets, getGivingTickets, receivingTickets, getReceivingTickets } = useTicketContext();
    const { userRelationId } = usePagePath();

    const currentRelation = userRelations?.find(relation => Number(relation.id) === userRelationId);

    useEffect(() => {
        if (userRelations === undefined) getUserRelations();
    }, [getUserRelations, userRelations]);

    useEffect(() => {
        if (currentRelation === undefined) return;
        if (givingTickets !== undefined) return;
        getGivingTickets(currentRelation.id);
    }, [currentRelation, getGivingTickets, givingTickets]);

    useEffect(() => {
        if (currentRelation === undefined) return;
        if (receivingTickets !== undefined) return;
        getReceivingTickets(currentRelation.id);
    }, [currentRelation, getReceivingTickets, receivingTickets]);

    if (!currentRelation) return <Navigate to="/login" />;
    return (
        <>
            <CommonAppBar handleLogout={handleLogout} currentRelation={currentRelation} />
            <BottomNav />
            <main>
                <Container sx={{ py: 8 }} maxWidth="md">
                    {givingTickets && receivingTickets && (
                        <Grid container spacing={4}>
                            {givingTickets
                                .filter(ticket => ticket.use_date !== null)
                                .concat(receivingTickets.filter(ticket => ticket.use_date !== null))
                                .sort((a, b) => {
                                    return a.use_date! > b.use_date! ? -1 : 1;
                                })
                                .map(ticket => {
                                    return <UsedTicket key={ticket.id} ticket={ticket} relatedUserName={currentRelation.related_username} />;
                                })}
                        </Grid>
                    )}
                </Container>
                <MiniLogo onClick={() => window.scroll({ top: 0, behavior: 'smooth' })} src="/apple-touch-icon.png" alt="mini-ticket" />
            </main>
        </>
    );
};

const MiniLogo = styled.img`
    height: 50px;
    position: fixed;
    bottom: 64px;
    right: 13px;
    box-shadow:
        2px 2px 7px rgba(18, 47, 61, 0.5),
        -5px -5px 15px rgba(248, 253, 255, 0.9),
        inset 5px 5px 15px transparent,
        inset -5px -5px 15px transparent;
    z-index: 100;
    border-radius: 50%;

    &:hover {
        opacity: 0.95;
        filter: brightness(105%);
    }
`;

interface UsedTicketProps {
    ticket: ITicket;
    relatedUserName: string;
    hasThreadPosts?: boolean;
    showAll?: boolean;
}

const UsedTicket = ({ ticket, relatedUserName, hasThreadPosts = true, showAll = false }: UsedTicketProps) => {
    const [openedDialog, setOpenedDialog] = useState<'Detail'>();

    const getDialog = () => {
        switch (openedDialog) {
            case 'Detail':
                return <DetailDialog ticket={ticket} onClose={() => setOpenedDialog(undefined)} relatedUserName={relatedUserName} />;
        }
    };

    if (ticket.use_date === null) return <></>;
    return (
        <StyledTicket item xs={12} sm={6} md={4}>
            <Card className="card">
                <CardContent>
                    {/* MYMEMO: user_id is hardcoded here. */}
                    <Stack direction="row" justifyContent="space-between">
                        <Typography className={`from-name${ticket.is_special ? ' special-ticket' : ''}`}>
                            {ticket.giving_user_id === 1 ? relatedUserName : '自分'}より
                        </Typography>
                        <Typography className="post-time">{format(new Date(ticket.use_date), 'yyyy-MM-dd HH:mm')}</Typography>
                    </Stack>
                    <Typography className="text">{ticket.use_description}</Typography>
                </CardContent>
                <CardActions className="card-actions">
                    <IconButton size="small" onClick={() => setOpenedDialog('Detail')}>
                        <InfoIcon />
                    </IconButton>
                    <IconButton size="small">
                        <EditIcon />
                    </IconButton>
                </CardActions>
                {ticket.is_special && <SpecialStamp randKey={ticket.id} />}
                {hasThreadPosts && (
                    <>
                        <ThreadPost relatedUserName={relatedUserName} showAll={showAll} />
                        {showAll && <ThreadPost relatedUserName={relatedUserName} showAll={showAll} isLast />}
                    </>
                )}
                {!showAll && (
                    <Button className="open-thread-button" variant="outlined">
                        スレッドを開く
                    </Button>
                )}
            </Card>
            {openedDialog && getDialog()}
        </StyledTicket>
    );
};

const StyledTicket = styled(Grid)`
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
                {isLast && (
                    <Button className="message-button" variant="outlined">
                        メッセージを送る
                    </Button>
                )}
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

export default UsedTickets;
