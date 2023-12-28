import { useState } from 'react';
import {
    AppBar,
    Button,
    Toolbar,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';

const TicketAppBar = () => {
    const [topBarDrawerOpen, setTopBarDrawerOpen] = useState(false);
    return (
        <AppBar position="fixed" sx={{ bgcolor: 'primary.light'}}>
            <Toolbar>
                <Link to="/tickets?user_relation_id=2" style={{ textDecorationLine: 'none' }}><Button sx={{ color: 'black' }}>もらったチケット</Button></Link>
                <Link to="/"><BookIcon sx={{ ml: 2, color: 'rgba(0,0,0,0.67)' }} /></Link>
                <div style={{flexGrow: 1}}></div>
                <IconButton onClick={() => setTopBarDrawerOpen(true)}><MenuIcon /></IconButton>
                <Drawer anchor='right' open={topBarDrawerOpen} onClose={() => setTopBarDrawerOpen(false)}>
                    <List>
                        <ListItem>
                            <ListItemButton disableGutters>
                                <ListItemIcon><PersonIcon /></ListItemIcon>
                                <ListItemText>他の相手</ListItemText>
                            </ListItemButton>
                            <ExpandMore />
                        </ListItem>
                        <List component='div' disablePadding>
                            <ListItem sx={{ pl: 4 }}>
                                <ListItemButton><ListItemText>こひる</ListItemText></ListItemButton>
                            </ListItem>
                        </List>
                        <ListItem>
                            <ListItemButton disableGutters>
                                <ListItemIcon><SearchIcon /></ListItemIcon>
                                <ListItemText>日付で検索</ListItemText>
                            </ListItemButton>
                        </ListItem>
                        <ListItem>
                            <ListItemButton disableGutters>
                                <ListItemIcon><HistoryIcon /></ListItemIcon>
                                <ListItemText>更新履歴</ListItemText>
                            </ListItemButton>
                        </ListItem>
                        <ListItem>
                            <ListItemButton disableGutters>
                                <ListItemIcon><LogoutIcon /></ListItemIcon>
                                <ListItemText>ログアウト</ListItemText>
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Drawer>
            </Toolbar>
        </AppBar>
    );
}
export default TicketAppBar;