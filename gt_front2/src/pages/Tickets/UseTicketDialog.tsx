import { Button, Dialog, DialogContent, Typography } from '@mui/material';
import { useState } from 'react';
import useTicketContext from '../../hooks/useTicketContext';
import UseDialog from './UseDialog';

interface UseTicketDialogProps {
    onClose: () => void;
}

const UseTicketDialog = ({ onClose }: UseTicketDialogProps) => {
    const [openedDialog, setOpenedDialog] = useState<'UseOldestNormal' | 'UseOldestSpecial'>();
    const { getLastAvailableNormalTicket, getLastAvailableSpecialTicket } = useTicketContext();

    const lastAvailableNormalTicket = getLastAvailableNormalTicket('Receiving');
    const lastAvailableSpecialTicket = getLastAvailableSpecialTicket('Receiving');

    const getDialog = () => {
        switch (openedDialog) {
            case 'UseOldestNormal':
                return lastAvailableNormalTicket !== undefined ? <UseDialog onClose={onClose} ticket={lastAvailableNormalTicket} /> : <></>;
            case 'UseOldestSpecial':
                return lastAvailableSpecialTicket !== undefined ? <UseDialog onClose={onClose} ticket={lastAvailableSpecialTicket} /> : <></>;
        }
    };
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
