import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import SellIcon from '@mui/icons-material/Sell';
import { AppBar, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DiariesAppBarProps {
    handleLogout: () => Promise<void>;
    userRelationId: number;
}

const DiariesAppBar = (props: DiariesAppBarProps) => {
    const { handleLogout, userRelationId } = props;

    const [topBarDrawerOpen, setTopBarDrawerOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <AppBar position='fixed' sx={{ bgcolor: 'primary.light' }}>
            <Toolbar>
                <div style={{ flexGrow: 1 }} />
                <IconButton onClick={() => setTopBarDrawerOpen(true)}>
                    <MenuIcon sx={{ color: 'rgba(0,0,0,0.67)' }} />
                </IconButton>
                <Drawer anchor='right' open={topBarDrawerOpen} onClose={() => setTopBarDrawerOpen(false)}>
                    <List>
                        <ListItem>
                            <ListItemButton
                                disableGutters
                                onClick={() => {
                                    window.scroll({ top: 0 });
                                    navigate(`/diary_tags?user_relation_id=${userRelationId}`);
                                }}
                            >
                                <ListItemIcon>
                                    <SellIcon />
                                </ListItemIcon>
                                <ListItemText>タグ編集</ListItemText>
                            </ListItemButton>
                        </ListItem>
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
