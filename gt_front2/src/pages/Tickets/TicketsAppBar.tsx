import { useState, useContext } from 'react';
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
import WifiProtectedSetupIcon from '@mui/icons-material/WifiProtectedSetup';
import RefreshIcon from '@mui/icons-material/Refresh';
import BookIcon from '@mui/icons-material/Book';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { IUserRelation, UserRelationContext } from '../../contexts/user-relation-context';

interface TicketAppBarProps {
    getTickets: () => Promise<void>;
    handleLogout: () => Promise<void>;
    currentRelation: IUserRelation;
}

const TicketAppBar = (props: TicketAppBarProps) => {
    const { getTickets, handleLogout, currentRelation } = props;

    const userRelationContext = useContext(UserRelationContext);
    const [topBarDrawerOpen, setTopBarDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const otherRelations = userRelationContext.userRelations.filter((relation, index, self) => relation.related_username !== currentRelation.related_username && self.findIndex(e => e.related_username === relation.related_username) === index);

    return (
        <AppBar position="fixed" sx={{ bgcolor: 'primary.light'}}>
            <Toolbar>
                <Button onClick={() => {navigate(`/tickets?user_relation_id=${currentRelation.corresponding_relation_id}`); window.scroll({top: 0});}} sx={{ color: 'rgba(0,0,0,0.67)' }}>{currentRelation.related_username}<WifiProtectedSetupIcon /></Button>
                <div style={{flexGrow: 1}}></div>
                <IconButton onClick={getTickets} sx={{ mr: 2, color: 'rgba(0,0,0,0.67)' }}><RefreshIcon /></IconButton>
                {/* TODO */}
                <IconButton onClick={() => navigate("/")} sx={{ mr: 2, color: 'rgba(0,0,0,0.67)' }}><BookIcon /></IconButton>
                <IconButton onClick={() => setTopBarDrawerOpen(true)}><MenuIcon sx={{color: 'rgba(0,0,0,0.67)'}} /></IconButton>
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
                            {otherRelations.map(relation => (
                                <ListItem key={relation.id} sx={{ pl: 4 }}>
                                    <ListItemButton
                                        onClick={() => {
                                            navigate(`/tickets?user_relation_id=${relation.id}`)
                                            setTopBarDrawerOpen(false);
                                            window.scroll({top: 0});
                                        }}
                                    ><ListItemText>{relation.related_username}</ListItemText></ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                        <ListItem>
                            <ListItemButton disableGutters>
                                <ListItemIcon><SearchIcon /></ListItemIcon>
                                <ListItemText>❌日付で検索</ListItemText>
                            </ListItemButton>
                        </ListItem>
                        <ListItem>
                            <ListItemButton disableGutters>
                                <ListItemIcon><HistoryIcon /></ListItemIcon>
                                <ListItemText>❌更新履歴</ListItemText>
                            </ListItemButton>
                        </ListItem>
                        <ListItem>
                            <ListItemButton disableGutters onClick={handleLogout}>
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