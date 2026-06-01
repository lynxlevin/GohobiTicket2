import { Button, Dialog, DialogContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import UseDialog from './UseDialog';
import { ITicket } from '../../types/ticket';
import { UserRelationAPI } from '../../apis/UserRelationAPI';

interface UseTicketDialogProps {
    onClose: () => void;
    userRelationId: number | null;
}

const UseTicketDialog = ({ onClose, userRelationId }: UseTicketDialogProps) => {
    const [openedDialog, setOpenedDialog] = useState<'UseOldestNormal' | 'UseOldestSpecial'>();
    const [lastAvailableNormalTicket, setLastAvailableNormalTicket] = useState<ITicket | null>();
    const [lastAvailableSpecialTicket, setLastAvailableSpecialTicket] = useState<ITicket | null>();

    const getDialog = () => {
        switch (openedDialog) {
            case 'UseOldestNormal':
                return !!lastAvailableNormalTicket ? <UseDialog onClose={onClose} ticket={lastAvailableNormalTicket} /> : <></>;
            case 'UseOldestSpecial':
                return !!lastAvailableSpecialTicket ? <UseDialog onClose={onClose} ticket={lastAvailableSpecialTicket} /> : <></>;
        }
    };

    useEffect(() => {
        if (userRelationId === null) return;
        UserRelationAPI.availableTickets({ userRelationId }).then(res => {
            setLastAvailableNormalTicket(res.data.oldest.normal);
            setLastAvailableSpecialTicket(res.data.oldest.special);
        });
    }, [userRelationId]);
    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogContent>
                <Typography>どのチケットを使いますか？</Typography>
                <Button onClick={() => setOpenedDialog('UseOldestNormal')} disabled={lastAvailableNormalTicket === undefined}>
                    一番古いチケットを使う
                </Button>
                <Button onClick={() => setOpenedDialog('UseOldestSpecial')} disabled={lastAvailableSpecialTicket === undefined}>
                    一番古い特別チケットを使う
                </Button>
            </DialogContent>
            {openedDialog && getDialog()}
        </Dialog>
    );
};

export default UseTicketDialog;
