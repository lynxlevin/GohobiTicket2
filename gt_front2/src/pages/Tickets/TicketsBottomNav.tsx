import BookIcon from '@mui/icons-material/Book';
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import WifiProtectedSetupIcon from '@mui/icons-material/WifiProtectedSetup';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IUserRelation } from '../../contexts/user-relation-context';
import useTicketContext from '../../hooks/useTicketContext';

interface TicketsBottomNavProps {
    currentRelation: IUserRelation;
    showOnlyUsed: boolean;
    lastAvailableTicketRef: React.MutableRefObject<HTMLDivElement | null>;
    isGivingRelation: boolean;
}

const TicketsBottomNav = (props: TicketsBottomNavProps) => {
    const { currentRelation, showOnlyUsed, lastAvailableTicketRef, isGivingRelation } = props;

    const navigate = useNavigate();
    const { getTickets, clearTickets } = useTicketContext();

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }} elevation={3}>
            <BottomNavigation showLabels>
                <BottomNavigationAction
                    label='To Used'
                    icon={<ExpandCircleDownOutlinedIcon />}
                    onClick={() => {
                        if (lastAvailableTicketRef.current !== null) window.scrollTo({ top: lastAvailableTicketRef.current.offsetTop, behavior: 'smooth' });
                    }}
                    disabled={showOnlyUsed}
                    sx={showOnlyUsed ? { color: 'lightgray' } : {}}
                />
                <BottomNavigationAction
                    label={currentRelation.related_username}
                    icon={<WifiProtectedSetupIcon />}
                    onClick={() => {
                        clearTickets();
                        const relationType = isGivingRelation ? 'is_receiving' : 'is_giving';
                        // MYMEMO: useUserAPI in Tickets does not re-run.
                        navigate(`/tickets?user_relation_id=${currentRelation.id}&${relationType}`);
                        window.scroll({ top: 0 });
                    }}
                />
                <BottomNavigationAction label='更新' icon={<RefreshIcon />} onClick={() => getTickets(currentRelation.id, isGivingRelation)} />
                <BottomNavigationAction
                    label='日記'
                    icon={<BookIcon />}
                    onClick={() => {
                        clearTickets();
                        navigate(`/diaries?user_relation_id=${currentRelation.id}`);
                    }}
                />
            </BottomNavigation>
        </Paper>
    );
};
export default TicketsBottomNav;
