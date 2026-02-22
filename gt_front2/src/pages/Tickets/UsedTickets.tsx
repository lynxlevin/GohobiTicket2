import styled from '@emotion/styled';
import { Button, Card, CardActions, CardContent, Container, Grid, Typography } from '@mui/material';
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
}

const UsedTicket = ({ ticket, relatedUserName }: UsedTicketProps) => {
    const [openedDialog, setOpenedDialog] = useState<'Detail'>();

    const getDialog = () => {
        switch (openedDialog) {
            case 'Detail':
                return <DetailDialog ticket={ticket} onClose={() => setOpenedDialog(undefined)} relatedUserName={relatedUserName} />;
        }
    };

    if (ticket.use_date === null) return <></>;
    return (
        <StyledGrid item xs={12} sm={6} md={4}>
            <Card className="card">
                <CardContent>
                    {/* MYMEMO: user_id is hardcoded here. */}
                    <Typography className="ticket-user">{ticket.giving_user_id === 1 ? relatedUserName : '自分'}からのお願い</Typography>
                    <Typography className="ticket-date">{format(new Date(ticket.use_date), 'yyyy-MM-dd')}</Typography>
                    <Typography className="ticket-description">{ticket.use_description}</Typography>
                </CardContent>
                <CardActions className="use-button">
                    <Button variant="outlined" onClick={() => setOpenedDialog('Detail')}>
                        お礼の内容を見る
                    </Button>
                </CardActions>
                {ticket.is_special && <SpecialStamp randKey={ticket.id} />}
            </Card>
            {openedDialog && getDialog()}
        </StyledGrid>
    );
};

const StyledGrid = styled(Grid)`
    .badge {
        display: block;
        margin-right: 28px;
    }
    .card {
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
    }

    .relative-div {
        position: relative;
    }

    .ticket-user {
        text-align: right;
    }

    .ticket-date {
        text-align: right;
        padding-bottom: 8px;
    }

    .edit-button {
        position: absolute;
        top: -8px;
        right: -7px;
    }

    .ticket-description {
        text-align: start;
        white-space: pre-wrap;
    }

    .use-button {
        justify-content: center;
        margin-bottom: 8px;
    }
`;

export default UsedTickets;
