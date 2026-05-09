import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import RedeemIcon from '@mui/icons-material/Redeem';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { CardMedia, CircularProgress, Container, Dialog, Grid, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import BottomNav from '../../components/BottomNav';
import useTicketContext from '../../hooks/useTicketContext';
import useUserAPI from '../../hooks/useUserAPI';
import Ticket from './Ticket';
import useUserRelationContext from '../../hooks/useUserRelationContext';
import usePagePath from '../../hooks/usePagePath';
import CommonAppBar from '../../components/CommonAppBar';
import { RelationKind } from '../../types/user_relation';
import UseTicketDialog from './UseTicketDialog';
import CreateTicketDialog from './CreateTicketDialog';

interface TicketsProps {
    relationKind: RelationKind;
}

type DialogType = 'TicketImage' | 'GiveTicket' | 'UseTicket';

// Copied template from https://github.com/mui/material-ui/tree/v5.15.2/docs/data/material/getting-started/templates/album
const Tickets = ({ relationKind }: TicketsProps) => {
    const [openedDialog, setOpenedDialog] = useState<DialogType>();

    const { handleLogout } = useUserAPI();
    const { getUserRelations, userRelations } = useUserRelationContext();
    const { givingTickets, receivingTickets, getReceivingTickets, getGivingTickets } = useTicketContext();
    const { userRelationId } = usePagePath();

    const currentRelation = userRelations?.find(relation => Number(relation.id) === userRelationId);
    const imageFile = relationKind === 'Receiving' ? currentRelation?.receiving_ticket_img : currentRelation?.giving_ticket_img;

    const ticketImage = () => {
        if (imageFile === null || currentRelation === undefined)
            return (
                <Paper sx={{ py: '4px', px: '8px', color: '#565656', background: '#ffeaea', border: 'dashed 1px #ffc3c3', boxShadow: '0 0 0 2px #ffeaea' }}>
                    <Typography fontSize="10px">
                        Thank you
                        <br />
                        very much!!
                    </Typography>
                </Paper>
            );

        return (
            <CardMedia
                onClick={() => setOpenedDialog('TicketImage')}
                sx={{ backgroundSize: 'contain', maxHeight: '50px', maxWidth: '120px', width: 'auto' }}
                component="img"
                image={`/ticket_images/${imageFile}`}
            />
        );
    };

    const tickets = relationKind === 'Receiving' ? receivingTickets : givingTickets;

    const getDialog = () => {
        switch (openedDialog) {
            case 'TicketImage':
                return (
                    <Dialog open={true} onClose={() => setOpenedDialog(undefined)} fullWidth>
                        <CardMedia sx={{ backgroundSize: 'contain' }} component="img" image={`/ticket_images/${imageFile}`} />
                    </Dialog>
                );
            case 'GiveTicket':
                return <CreateTicketDialog onClose={() => setOpenedDialog(undefined)} />;
            case 'UseTicket':
                return <UseTicketDialog onClose={() => setOpenedDialog(undefined)} />;
        }
    };

    useEffect(() => {
        if (userRelations === undefined) getUserRelations();
    }, [getUserRelations, userRelations]);

    useEffect(() => {
        if (userRelationId === null || !currentRelation) return;
        switch (relationKind) {
            case 'Receiving':
                if (receivingTickets !== undefined) return;
                getReceivingTickets(userRelationId);
                return;
            case 'Giving':
                if (givingTickets !== undefined) return;
                getGivingTickets(userRelationId);
                return;
        }
    }, [currentRelation, getGivingTickets, getReceivingTickets, givingTickets, receivingTickets, relationKind, userRelationId]);

    return (
        <>
            <CommonAppBar handleLogout={handleLogout} currentRelation={currentRelation} leftItem={ticketImage()} />
            <BottomNav />
            {currentRelation === undefined || tickets === undefined ? (
                <CircularProgress />
            ) : (
                <main>
                    <Container maxWidth="sm" sx={{ py: 8 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" height="40px">
                            <Typography variant="body1" color="text.primary" textAlign="left" fontWeight="bold">
                                {currentRelation.related_username}に{relationKind === 'Receiving' ? 'もらった' : 'あげる'}
                                チケット
                            </Typography>
                            <Stack direction="row">
                                {relationKind === 'Giving' && (
                                    <IconButton onClick={() => setOpenedDialog('GiveTicket')}>
                                        <AddIcon />
                                    </IconButton>
                                )}
                                {relationKind === 'Receiving' && (
                                    <IconButton onClick={() => setOpenedDialog('UseTicket')}>
                                        <RedeemIcon />
                                    </IconButton>
                                )}
                            </Stack>
                        </Stack>
                        <Grid container spacing={2}>
                            {tickets.map(ticket => (
                                <Ticket key={ticket.id} ticket={ticket} relationKind={relationKind} />
                            ))}
                        </Grid>
                        <ToTopButton onClick={() => window.scroll({ top: 0, behavior: 'smooth' })}>
                            <KeyboardDoubleArrowUpIcon />
                        </ToTopButton>
                        {openedDialog && getDialog()}
                    </Container>
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

export default Tickets;
