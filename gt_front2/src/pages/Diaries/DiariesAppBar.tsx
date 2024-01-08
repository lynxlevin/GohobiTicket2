import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import RedeemIcon from '@mui/icons-material/Redeem';
import RefreshIcon from '@mui/icons-material/Refresh';
import SellIcon from '@mui/icons-material/Sell';
import { AppBar, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DiariesAppBarProps {
    handleLogout: () => Promise<void>;
    userRelationId: number;
    refreshDiaries: () => void;
    setIsDiaryTagDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DiariesAppBar = (props: DiariesAppBarProps) => {
    const { handleLogout, userRelationId, refreshDiaries, setIsDiaryTagDialogOpen } = props;

    const [topBarDrawerOpen, setTopBarDrawerOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <AppBar position='fixed' sx={{ bgcolor: 'primary.light' }}>
            <Toolbar>
                <div style={{ flexGrow: 1 }} />
                <IconButton onClick={refreshDiaries} sx={{ mr: 2, color: 'rgba(0,0,0,0.67)' }}>
                    <RefreshIcon />
                </IconButton>
                <IconButton
                    onClick={() => {
                        window.scroll({ top: 0 });
                        navigate(`/tickets?user_relation_id=${userRelationId}`);
                    }}
                    sx={{ mr: 2, color: 'rgba(0,0,0,0.67)' }}
                >
                    <RedeemIcon />
                </IconButton>
                <IconButton onClick={() => setTopBarDrawerOpen(true)}>
                    <MenuIcon sx={{ color: 'rgba(0,0,0,0.67)' }} />
                </IconButton>
                <Drawer anchor='right' open={topBarDrawerOpen} onClose={() => setTopBarDrawerOpen(false)}>
                    <List>
                        <ListItem>
                            <ListItemButton disableGutters onClick={() => setIsDiaryTagDialogOpen(true)}>
                                <ListItemIcon>
                                    <SellIcon />
                                </ListItemIcon>
                                <ListItemText>タグ編集</ListItemText>
                            </ListItemButton>
                        </ListItem>
                    </List>
                    <List>
                        <ListItem>
                            <ListItemButton disableGutters onClick={handleLogout}>
                                <ListItemIcon>
                                    <LogoutIcon />
                                </ListItemIcon>
                                <ListItemText>ログアウト</ListItemText>
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Drawer>
            </Toolbar>
        </AppBar>
    );
};
export default DiariesAppBar;
