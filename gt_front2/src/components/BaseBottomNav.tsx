import BookIcon from '@mui/icons-material/Book';
import RedeemIcon from '@mui/icons-material/Redeem';
import SwitchAccessShortcutIcon from '@mui/icons-material/SwitchAccessShortcut';
import { Badge, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';

export type NavItem = 'giving_tickets' | 'receiving_tickets' | 'wishes' | 'diaries';
export interface BottomNavBadges {
    givingTickets?: number;
    receivingTickets?: number;
    diaries?: number;
}
interface BaseBottomNavProps {
    selectedNavItem?: NavItem;
    handleSelect: (_: React.SyntheticEvent, newValue: NavItem) => void;
    navActions: {
        giving_tickets: () => void;
        receiving_tickets: () => void;
        wishes?: () => void;
        diaries: () => void;
    };
    badges?: BottomNavBadges;
}

const BaseBottomNav = ({ selectedNavItem, handleSelect, navActions, badges }: BaseBottomNavProps) => {
    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }} elevation={3}>
            <BottomNavigation showLabels value={selectedNavItem} onChange={handleSelect}>
                <BottomNavigationAction
                    value="giving_tickets"
                    label="あげる"
                    icon={
                        <Badge
                            badgeContent={badges?.givingTickets}
                            color="primary"
                            variant={badges?.givingTickets === 0 ? 'dot' : 'standard'}
                            showZero
                            max={999}
                        >
                            <SwitchAccessShortcutIcon />
                        </Badge>
                    }
                    onClick={navActions.giving_tickets}
                />
                <BottomNavigationAction
                    value="receiving_tickets"
                    label="もらう"
                    icon={
                        <Badge
                            badgeContent={badges?.receivingTickets}
                            color="primary"
                            variant={badges?.receivingTickets === 0 ? 'dot' : 'standard'}
                            showZero
                            max={999}
                        >
                            <SwitchAccessShortcutIcon style={{ rotate: '180deg' }} />
                        </Badge>
                    }
                    onClick={navActions.receiving_tickets}
                />
                {navActions.wishes && <BottomNavigationAction icon={<RedeemIcon />} value="wishes" label="おねがい" onClick={navActions.wishes} />}
                <BottomNavigationAction
                    value="diaries"
                    label="日記"
                    icon={
                        <Badge badgeContent={badges?.diaries} color="primary" variant={badges?.diaries === 0 ? 'dot' : 'standard'} showZero max={999}>
                            <BookIcon />
                        </Badge>
                    }
                    onClick={navActions.diaries}
                />
            </BottomNavigation>
        </Paper>
    );
};
export default BaseBottomNav;
