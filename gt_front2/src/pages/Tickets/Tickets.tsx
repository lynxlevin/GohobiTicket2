import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import RedeemIcon from '@mui/icons-material/Redeem';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { CardMedia, CircularProgress, Container, Dialog, Grid, IconButton, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
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
import { addMonths, format, parse, subMonths } from 'date-fns';
import useYearMonthContext from '../../hooks/useYearMonthContext';

interface TicketsProps {
    relationKind: RelationKind;
}

type DialogType = 'TicketImage' | 'GiveTicket' | 'UseTicket';

// Copied template from https://github.com/mui/material-ui/tree/v5.15.2/docs/data/material/getting-started/templates/album
const Tickets = ({ relationKind }: TicketsProps) => {
    const [openedDialog, setOpenedDialog] = useState<DialogType>();

    const { handleLogout } = useUserAPI();
    const { getUserRelations, userRelations } = useUserRelationContext();
    const { givingTicketsByMonth, receivingTicketsByMonth, getGivingTicketsByMonth, getReceivingTicketsByMonth } = useTicketContext();
    const { yearMonth, setYearMonth, thisMonth, getTabYearMonths, getFirstDate } = useYearMonthContext();

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

    const tickets = relationKind === 'Receiving' ? receivingTicketsByMonth : givingTicketsByMonth;

    const tabYearMonth = useMemo(() => {
        return getTabYearMonths(relationKind === 'Giving' ? 'GivingTicket' : 'ReceivingTicket', currentRelation);
    }, [currentRelation, getTabYearMonths, relationKind]);
    const firstDate = useMemo(() => {
        return getFirstDate(relationKind === 'Giving' ? 'GivingTicket' : 'ReceivingTicket', currentRelation);
    }, [currentRelation, getFirstDate, relationKind]);

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
        if (!tabYearMonth.includes(yearMonth)) setYearMonth(format(firstDate, 'yyyyMM'));
    }, [firstDate, setYearMonth, tabYearMonth, yearMonth]);
    useEffect(() => {
        if (userRelationId === null || !currentRelation) return;
        switch (relationKind) {
            case 'Receiving':
                if (receivingTicketsByMonth !== undefined && receivingTicketsByMonth[yearMonth] !== undefined) return;
                getReceivingTicketsByMonth(userRelationId, yearMonth);
                return;
            case 'Giving':
                if (givingTicketsByMonth !== undefined && givingTicketsByMonth[yearMonth] !== undefined) return;
                getGivingTicketsByMonth(userRelationId, yearMonth);
                return;
        }
    }, [
        currentRelation,
        getGivingTicketsByMonth,
        getReceivingTicketsByMonth,
        givingTicketsByMonth,
        receivingTicketsByMonth,
        relationKind,
        userRelationId,
        yearMonth,
    ]);

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
                        <Stack direction="row" justifyContent="center" alignItems="center">
                            <IconButton
                                onClick={() => {
                                    yearMonth !== format(firstDate, 'yyyyMM') &&
                                        setYearMonth(format(subMonths(parse(yearMonth, 'yyyyMM', new Date()), 1), 'yyyyMM'));
                                }}
                                disabled={yearMonth === format(firstDate, 'yyyyMM')}
                                sx={{ marginRight: 5 }}
                            >
                                <KeyboardArrowLeftIcon />
                            </IconButton>
                            <Select value={yearMonth} onChange={event => setYearMonth(event.target.value)} variant="standard">
                                {tabYearMonth.map(yearMonth => {
                                    return <MenuItem key={yearMonth} value={yearMonth}>{`${yearMonth.slice(0, 4)}/${yearMonth.slice(4, 6)}`}</MenuItem>;
                                })}
                            </Select>
                            <IconButton
                                onClick={() => {
                                    yearMonth !== thisMonth && setYearMonth(format(addMonths(parse(yearMonth, 'yyyyMM', new Date()), 1), 'yyyyMM'));
                                }}
                                disabled={yearMonth === thisMonth}
                                sx={{ marginLeft: 5 }}
                            >
                                <KeyboardArrowRightIcon />
                            </IconButton>
                        </Stack>
                        {tickets === undefined || tickets[yearMonth] === undefined ? (
                            <CircularProgress />
                        ) : (
                            <Grid container spacing={2}>
                                {tickets[yearMonth].map(ticket => (
                                    <Ticket key={ticket.id} ticket={ticket} relationKind={relationKind} />
                                ))}
                            </Grid>
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
