import BookIcon from '@mui/icons-material/Book';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import WifiProtectedSetupIcon from '@mui/icons-material/WifiProtectedSetup';
import { AppBar, Button, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IUserRelation, UserRelationContext } from '../../contexts/user-relation-context';
import useTicketContext from '../../hooks/useTicketContext';

interface TicketsAppBarProps {
    handleLogout: () => Promise<void>;
    currentRelation: IUserRelation;
}

const TicketsAppBar = (props: TicketsAppBarProps) => {
    const { handleLogout, currentRelation } = props;

    const userRelationContext = useContext(UserRelationContext);
    const [topBarDrawerOpen, setTopBarDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const { getTickets, clearTickets } = useTicketContext();

    const otherRelations = userRelationContext.userRelations.filter(
        (relation, index, self) =>
            relation.related_username !== currentRelation.related_username && self.findIndex(e => e.related_username === relation.related_username) === index,
    );

    return (
        <AppBar position='fixed' sx={{ bgcolor: 'primary.light' }}>
            <Toolbar>
                <Button
                    onClick={() => {
                        clearTickets();
                        navigate(`/tickets?user_relation_id=${currentRelation.corresponding_relation_id}`);
                        window.scroll({ top: 0 });
                    }}
                    sx={{ color: 'rgba(0,0,0,0.67)' }}
                >
                    {currentRelation.related_username}
                    <WifiProtectedSetupIcon />
                </Button>
                <div style={{ flexGrow: 1 }} />
                <IconButton onClick={() => getTickets(currentRelation.id)} sx={{ mr: 2, color: 'rgba(0,0,0,0.67)' }}>
                    <RefreshIcon />
                </IconButton>
                {/* TODO: dynamic user_relation_id */}
                <IconButton onClick={() => navigate('/diaries?user_relation_id=1')} sx={{ mr: 2, color: 'rgba(0,0,0,0.67)' }}>
                    <BookIcon />
                </IconButton>
                <IconButton onClick={() => setTopBarDrawerOpen(true)}>
                    <MenuIcon sx={{ color: 'rgba(0,0,0,0.67)' }} />
                </IconButton>
                <Drawer anchor='right' open={topBarDrawerOpen} onClose={() => setTopBarDrawerOpen(false)}>
                    <List>
                        <ListItem>
                            <ListItemButton disableGutters>
                                <ListItemIcon>
                                    <PersonIcon />
                                </ListItemIcon>
                                <ListItemText>他の相手</ListItemText>
                            </ListItemButton>
                            <ExpandMore />
                        </ListItem>
                        <List component='div' disablePadding>
                            {otherRelations.map(relation => (
                                <ListItem key={relation.id} sx={{ pl: 4 }}>
                                    <ListItemButton
                                        onClick={() => {
                                            clearTickets();
                                            navigate(`/tickets?user_relation_id=${relation.id}`);
                                            setTopBarDrawerOpen(false);
                                            window.scroll({ top: 0 });
                                        }}
                                    >
                                        <ListItemText>{relation.related_username}</ListItemText>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
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
export default TicketsAppBar;
