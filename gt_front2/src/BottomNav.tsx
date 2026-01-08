import BookIcon from '@mui/icons-material/Book';
import SwitchAccessShortcutIcon from '@mui/icons-material/SwitchAccessShortcut';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useTicketContext from './hooks/useTicketContext';

type PagePath = 'giving_tickets' | 'receiving_tickets' | 'diaries';

const BottomNav = () => {
    const pathParams = useParams();
    const location = useLocation();
    const userRelationId = Number(pathParams.userRelationId);

    const [selected, setSelected] = useState<PagePath>(location.pathname.split('/').at(-1) as PagePath);
    const handleSelect = (_: React.SyntheticEvent, newValue: PagePath) => {
        setSelected(newValue);
    };

    const navigate = useNavigate();
    const { clearTickets } = useTicketContext();
    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }} elevation={3}>
            <BottomNavigation showLabels value={selected} onChange={handleSelect}>
                <BottomNavigationAction
                    value="giving_tickets"
                    label="あげる"
                    icon={<SwitchAccessShortcutIcon />}
                    onClick={() => {
                        clearTickets();
                        // MYMEMO: useUserAPI in Tickets does not re-run.
                        navigate(`/user_relations/${userRelationId}/giving_tickets`);
                        window.scroll({ top: 0 });
                    }}
                />
                <BottomNavigationAction
                    value="receiving_tickets"
                    label="もらう"
                    icon={<SwitchAccessShortcutIcon style={{ rotate: '180deg' }} />}
                    onClick={() => {
                        clearTickets();
                        // MYMEMO: useUserAPI in Tickets does not re-run.
                        navigate(`/user_relations/${userRelationId}/receiving_tickets`);
                        window.scroll({ top: 0 });
                    }}
                />
                <BottomNavigationAction
                    value="diaries"
                    label="日記"
                    icon={<BookIcon />}
                    onClick={() => {
                        clearTickets();
                        navigate(`/user_relations/${userRelationId}/diaries`);
                    }}
                />
            </BottomNavigation>
        </Paper>
    );
};
export default BottomNav;
