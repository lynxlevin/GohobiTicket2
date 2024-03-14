import BookIcon from '@mui/icons-material/Book';
import RefreshIcon from '@mui/icons-material/Refresh';
import WifiProtectedSetupIcon from '@mui/icons-material/WifiProtectedSetup';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IUserRelation } from '../../contexts/user-relation-context';
import useTicketContext from '../../hooks/useTicketContext';

interface TicketsBottomNavProps {
    currentRelation: IUserRelation;
}

const TicketsBottomNav = (props: TicketsBottomNavProps) => {
    const { currentRelation } = props;

    const navigate = useNavigate();
    const { getTickets, clearTickets } = useTicketContext();

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }} elevation={3}>
            <BottomNavigation showLabels>
                <BottomNavigationAction
                    label={currentRelation.related_username}
                    icon={<WifiProtectedSetupIcon />}
                    onClick={() => {
                        clearTickets();
                        navigate(`/tickets?user_relation_id=${currentRelation.corresponding_relation_id}`);
                        window.scroll({ top: 0 });
                    }}
                />
                <BottomNavigationAction label='更新' icon={<RefreshIcon />} onClick={() => getTickets(currentRelation.id)} />
                {/* MYMEMO: dynamic user_relation_id */}
                <BottomNavigationAction
                    label='日記'
                    icon={<BookIcon />}
                    onClick={() => {
                        clearTickets();
                        navigate('/diaries?user_relation_id=1');
                    }}
                />
            </BottomNavigation>
        </Paper>
    );
};
export default TicketsBottomNav;
