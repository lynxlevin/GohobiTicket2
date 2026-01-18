import BookIcon from '@mui/icons-material/Book';
import SwitchAccessShortcutIcon from '@mui/icons-material/SwitchAccessShortcut';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePagePath, { PagePath } from '../hooks/usePagePath';

const BottomNav = () => {
    const { userRelationId, pagePath } = usePagePath();

    const [selected, setSelected] = useState<PagePath>();
    const handleSelect = (_: React.SyntheticEvent, newValue: PagePath) => {
        setSelected(newValue);
    };

    const navigate = useNavigate();

    useEffect(() => {
        setSelected(pagePath);
    }, [pagePath]);
    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }} elevation={3}>
            <BottomNavigation showLabels value={selected} onChange={handleSelect}>
                <BottomNavigationAction
                    value="giving_tickets"
                    label="あげる"
                    icon={<SwitchAccessShortcutIcon />}
                    onClick={() => {
                        navigate(`/user_relations/${userRelationId}/giving_tickets`);
                        window.scroll({ top: 0 });
                    }}
                />
                <BottomNavigationAction
                    value="receiving_tickets"
                    label="もらう"
                    icon={<SwitchAccessShortcutIcon style={{ rotate: '180deg' }} />}
                    onClick={() => {
                        navigate(`/user_relations/${userRelationId}/receiving_tickets`);
                        window.scroll({ top: 0 });
                    }}
                />
                <BottomNavigationAction
                    value="diaries"
                    label="日記"
                    icon={<BookIcon />}
                    onClick={() => {
                        navigate(`/user_relations/${userRelationId}/diaries`);
                    }}
                />
            </BottomNavigation>
        </Paper>
    );
};
export default BottomNav;
