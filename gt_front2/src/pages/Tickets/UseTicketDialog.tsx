import { Button, Dialog, DialogContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import UseDialog from './UseDialog';
import { ITicket } from '../../types/ticket';
import { UserRelationAPI } from '../../apis/UserRelationAPI';
import { IUserRelation } from '../../types/user_relation';

interface UseTicketDialogProps {
    onClose: () => void;
    currentUserRelation: IUserRelation;
}

const UseTicketDialog = ({ onClose, currentUserRelation }: UseTicketDialogProps) => {
    const [openedDialog, setOpenedDialog] = useState<'UseOldestNormal' | 'UseOldestSpecial'>();
    const [lastAvailableNormalTicket, setLastAvailableNormalTicket] = useState<ITicket | null>();
    const [lastAvailableSpecialTicket, setLastAvailableSpecialTicket] = useState<ITicket | null>();

    const getDialog = () => {
        switch (openedDialog) {
            case 'UseOldestNormal':
                return !!lastAvailableNormalTicket ? (
                    <UseDialog onClose={onClose} ticket={lastAvailableNormalTicket} currentUserRelation={currentUserRelation} />
                ) : (
                    <></>
                );
            case 'UseOldestSpecial':
                return !!lastAvailableSpecialTicket ? (
                    <UseDialog onClose={onClose} ticket={lastAvailableSpecialTicket} currentUserRelation={currentUserRelation} />
                ) : (
                    <></>
                );
        }
    };

    useEffect(() => {
        UserRelationAPI.availableTickets({ userRelationId: currentUserRelation.id }).then(res => {
            setLastAvailableNormalTicket(res.data.oldest.normal);
            setLastAvailableSpecialTicket(res.data.oldest.special);
        });
    }, [currentUserRelation]);
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
