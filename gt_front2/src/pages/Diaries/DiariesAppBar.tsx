import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
import SellIcon from '@mui/icons-material/Sell';
import SecurityUpdateGoodIcon from '@mui/icons-material/SecurityUpdateGood';
import { AppBar, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Slide, Toolbar, useScrollTrigger } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface HideOnScrollProps {
    children: React.ReactElement;
}

const HideOnScroll = (props: HideOnScrollProps) => {
    const { children } = props;
    const trigger = useScrollTrigger({
        target: window,
    });

    return (
        <Slide appear={false} direction='down' in={!trigger}>
            {children}
        </Slide>
    );
};

interface DiariesAppBarProps {
    handleLogout: () => Promise<void>;
    userRelationId: number;
    refreshDiaries: () => void;
}

const DiariesAppBar = (props: DiariesAppBarProps) => {
    const { handleLogout, userRelationId, refreshDiaries } = props;

    const [topBarDrawerOpen, setTopBarDrawerOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <HideOnScroll>
            <AppBar position='fixed' sx={{ bgcolor: 'primary.light' }}>
                <Toolbar>
                    <div style={{ flexGrow: 1 }} />
                    <IconButton onClick={() => setTopBarDrawerOpen(true)}>
                        <MenuIcon sx={{ color: 'rgba(0,0,0,0.67)' }} />
                    </IconButton>
                    <Drawer anchor='right' open={topBarDrawerOpen} onClose={() => setTopBarDrawerOpen(false)}>
                        <List>
                            <ListItem disableGutters>
                                <ListItemButton
                                    onClick={() => {
                                        refreshDiaries(); setTopBarDrawerOpen(false);
                                    }}
                                >
                                    <ListItemIcon>
                                        <RefreshIcon />
                                    </ListItemIcon>
                                    <ListItemText>更新</ListItemText>
                                </ListItemButton>
                            </ListItem>
                            <ListItem>
                                <ListItemButton
                                    disableGutters
                                    onClick={() => {
                                        window.scroll({ top: 0 });
                                        navigate(`/user_relations/${userRelationId}/diary_tags`);
                                    }}
                                >
                                    <ListItemIcon>
                                        <SellIcon />
                                    </ListItemIcon>
                                    <ListItemText>タグ編集</ListItemText>
                                </ListItemButton>
                            </ListItem>
                            <ListItem>
                                <ListItemButton disableGutters onClick={() => {window.location.reload();}}>
                                    <ListItemIcon>
                                        <SecurityUpdateGoodIcon />
                                    </ListItemIcon>
                                    <ListItemText>バージョンアップ</ListItemText>
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
        </HideOnScroll>
    );
};
export default DiariesAppBar;
