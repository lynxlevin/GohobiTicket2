import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RedeemIcon from '@mui/icons-material/Redeem';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import {
    Badge,
    CardMedia,
    CircularProgress,
    Container,
    Dialog,
    DialogContent,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    Paper,
    Stack,
    Switch,
    Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import BottomNav from '../../components/BottomNav';
import useTicketContext from '../../hooks/useTicketContext';
import useUserAPI from '../../hooks/useUserAPI';
import Ticket from './Ticket';
import TicketForm from './TicketForm';
import useUserRelationContext from '../../hooks/useUserRelationContext';
import usePagePath from '../../hooks/usePagePath';
import CommonAppBar from '../../components/CommonAppBar';
import { RelationKind } from '../../types/user_relation';
import UseTicketDialog from './UseTicketDialog';

interface TicketsProps {
    relationKind: RelationKind;
}

type DialogType = 'TicketImage' | 'GiveTicket' | 'UseTicket' | 'FilterTickets';

// Copied template from https://github.com/mui/material-ui/tree/v5.15.2/docs/data/material/getting-started/templates/album
const Tickets = ({ relationKind }: TicketsProps) => {
    const lastAvailableTicketRef = useRef<HTMLDivElement | null>(null);

    const [showOnlySpecial, setShowOnlySpecial] = useState(false);
    const [showOnlyUsed, setShowOnlyUsed] = useState(false);
    const [openedDialog, setOpenedDialog] = useState<DialogType>();
    const { handleLogout } = useUserAPI();
    const { getUserRelations, userRelations } = useUserRelationContext();
    const { givingTickets, receivingTickets, getReceivingTickets, getGivingTickets, getSortedTickets, getLastAvailableTicketId } = useTicketContext();
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
    const ticketCount = tickets !== undefined ? tickets.length : 0;
    const isSpecialNumber = ticketCount > 0 && (ticketCount % 100 === 0 || ticketCount % 111 === 0 || ticketCount % 1111 === 0);

    const getDialog = () => {
        switch (openedDialog) {
            case 'TicketImage':
                return (
                    <Dialog open={true} onClose={() => setOpenedDialog(undefined)} fullWidth>
                        <CardMedia sx={{ backgroundSize: 'contain' }} component="img" image={`/ticket_images/${imageFile}`} />
                    </Dialog>
                );
            case 'GiveTicket':
                return (
                    <Dialog open={true} onClose={() => setOpenedDialog(undefined)} fullWidth>
                        <DialogContent>
                            <TicketForm />
                        </DialogContent>
                    </Dialog>
                );
            case 'UseTicket':
                return <UseTicketDialog onClose={() => setOpenedDialog(undefined)} />;
            case 'FilterTickets':
                return (
                    <Dialog open={true} onClose={() => setOpenedDialog(undefined)} fullWidth>
                        <DialogContent>
                            <FormGroup>
                                <FormControlLabel
                                    label="特別チケットのみ表示"
                                    control={<Switch checked={showOnlySpecial} onChange={event => setShowOnlySpecial(event.target.checked)} />}
                                />
                                <FormControlLabel
                                    label="使用済みチケットのみ表示"
                                    control={<Switch checked={showOnlyUsed} onChange={event => setShowOnlyUsed(event.target.checked)} />}
                                />
                            </FormGroup>
                        </DialogContent>
                    </Dialog>
                );
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
            {currentRelation === undefined ? (
                <CircularProgress />
            ) : (
                <main>
                    <Container maxWidth="sm" sx={{ py: 8 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" height="40px">
                            <Typography variant="body1" color="text.primary" textAlign="left" fontWeight="bold">
                                {currentRelation.related_username}に{relationKind === 'Receiving' ? 'もらった' : 'あげる'}
                                ごほうびチケット
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
                                <Badge badgeContent={Number(showOnlySpecial) + Number(showOnlyUsed)} color="primary" overlap="circular">
                                    <IconButton onClick={() => setOpenedDialog('FilterTickets')}>
                                        <FilterAltIcon />
                                    </IconButton>
                                </Badge>
                            </Stack>
                        </Stack>
                        {isSpecialNumber ? (
                            <Typography variant="h6" align="left" color="text.primary" gutterBottom>
                                計<GoldNumber>{ticketCount}</GoldNumber>枚
                            </Typography>
                        ) : (
                            <Typography variant="h6" align="left" color="text.primary" gutterBottom>
                                計{ticketCount}枚
                            </Typography>
                        )}
                        <Grid container spacing={4}>
                            {getSortedTickets({ showOnlySpecial, showOnlyUsed, relationKind }).map(ticket => {
                                if (ticket.id === getLastAvailableTicketId(relationKind)) {
                                    return (
                                        <Ticket key={ticket.id} lastAvailableTicketRef={lastAvailableTicketRef} ticket={ticket} relationKind={relationKind} />
                                    );
                                }
                                return <Ticket key={ticket.id} ticket={ticket} relationKind={relationKind} />;
                            })}
                        </Grid>
                        {!showOnlyUsed && !showOnlySpecial && (
                            <ToLastAvailableTicketButton
                                onClick={() => {
                                    if (lastAvailableTicketRef.current !== null)
                                        window.scrollTo({ top: lastAvailableTicketRef.current.offsetTop, behavior: 'smooth' });
                                }}
                            >
                                <KeyboardDoubleArrowDownIcon />
                            </ToLastAvailableTicketButton>
                        )}
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

const ToLastAvailableTicketButton = styled(IconButton)`
    font-size: 30px;
    background: white !important;
    border-radius: 999px;
    position: fixed;
    left: 16px;
    bottom: 66px;
    border: 2px solid #ddd;
    width: 40px;
    height: 40px;
    z-index: 100;
`;
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

const GoldNumber = styled.span`
    font-size: 2.5rem;
    padding: 8px;
    background: linear-gradient(to bottom, #cfc09f 27%, #ffecb3 40%, #3a2c0f 78%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: #fff;
    font-weight: bold;
`;

export default Tickets;
