import BookIcon from '@mui/icons-material/Book';
import SwitchAccessShortcutIcon from '@mui/icons-material/SwitchAccessShortcut';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';

export type NavItem = 'giving_tickets' | 'receiving_tickets' | 'diaries';
interface BaseBottomNavProps {
    selectedNavItem?: NavItem;
    handleSelect: (_: React.SyntheticEvent, newValue: NavItem) => void;
    navActions: {
        giving_tickets: () => void;
        receiving_tickets: () => void;
        diaries: () => void;
    };
}

const BaseBottomNav = ({ selectedNavItem, handleSelect, navActions }: BaseBottomNavProps) => {
    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }} elevation={3}>
            <BottomNavigation showLabels value={selectedNavItem} onChange={handleSelect}>
                <BottomNavigationAction value="giving_tickets" label="あげる" icon={<SwitchAccessShortcutIcon />} onClick={navActions.giving_tickets} />
                <BottomNavigationAction
                    value="receiving_tickets"
                    label="もらう"
                    icon={<SwitchAccessShortcutIcon style={{ rotate: '180deg' }} />}
                    onClick={navActions.receiving_tickets}
                />
                <BottomNavigationAction value="diaries" label="日記" icon={<BookIcon />} onClick={navActions.diaries} />
            </BottomNavigation>
        </Paper>
    );
};
export default BaseBottomNav;
