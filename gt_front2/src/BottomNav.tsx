import BookIcon from '@mui/icons-material/Book';
import SwitchAccessShortcutIcon from '@mui/icons-material/SwitchAccessShortcut';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import useTicketContext from './hooks/useTicketContext';

const BottomNav = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const userRelationId = Number(searchParams.get('user_relation_id'));
    const getCurrentPage = () => {
        const type = location.pathname.split('/')[1];
        if (type === 'diaries') return 'diaries';

        const is_giving = searchParams.get('is_giving');
        if (is_giving === '') return 'giving';
        return 'receiving';
    };

    const [selected, setSelected] = useState(getCurrentPage());
    const handleSelect = (_: React.SyntheticEvent, newValue: string) => {
        setSelected(newValue);
    };

    const navigate = useNavigate();
    const { clearTickets } = useTicketContext();

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }} elevation={3}>
            <BottomNavigation showLabels value={selected} onChange={handleSelect}>
                <BottomNavigationAction
                    value='giving'
                    label='あげる'
                    icon={<SwitchAccessShortcutIcon />}
                    onClick={() => {
                        clearTickets();
                        // MYMEMO: useUserAPI in Tickets does not re-run.
                        navigate(`/tickets?user_relation_id=${userRelationId}&is_giving`);
                        window.scroll({ top: 0 });
                    }}
                />
                <BottomNavigationAction
                    value='receiving'
                    label='もらう'
                    icon={<SwitchAccessShortcutIcon style={{ rotate: '180deg' }} />}
                    onClick={() => {
                        clearTickets();
                        // MYMEMO: useUserAPI in Tickets does not re-run.
                        navigate(`/tickets?user_relation_id=${userRelationId}&is_receiving`);
                        window.scroll({ top: 0 });
                    }}
                />
                <BottomNavigationAction
                    value='diaries'
                    label='日記'
                    icon={<BookIcon />}
                    onClick={() => {
                        clearTickets();
                        navigate(`/diaries?user_relation_id=${userRelationId}`);
                    }}
                />
            </BottomNavigation>
        </Paper>
    );
};
export default BottomNav;
