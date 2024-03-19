import ExpandMore from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AppBar, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Slide, Toolbar, useScrollTrigger } from '@mui/material';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IUserRelation, UserRelationContext } from '../../contexts/user-relation-context';
import useTicketContext from '../../hooks/useTicketContext';

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

interface TicketsAppBarProps {
    handleLogout: () => Promise<void>;
    currentRelation: IUserRelation;
    isGivingRelation: boolean;
}

const TicketsAppBar = (props: TicketsAppBarProps) => {
    const { handleLogout, currentRelation, isGivingRelation } = props;

    const userRelationContext = useContext(UserRelationContext);
    const [topBarDrawerOpen, setTopBarDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const { getTickets, clearTickets } = useTicketContext();

    const otherRelations = userRelationContext.userRelations.filter(
        (relation, _index, _self) => relation.related_username !== currentRelation.related_username,
    );

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
                                        getTickets(currentRelation.id, isGivingRelation).then(() => setTopBarDrawerOpen(false));
                                    }}
                                >
                                    <ListItemIcon>
                                        <RefreshIcon />
                                    </ListItemIcon>
                                    <ListItemText>更新</ListItemText>
                                </ListItemButton>
                            </ListItem>
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
                                    <ListItem key={relation.id}>
                                        <ListItemButton
                                            onClick={() => {
                                                clearTickets();
                                                navigate(`/tickets?user_relation_id=${relation.id}&is_receiving`);
                                                setTopBarDrawerOpen(false);
                                                window.scroll({ top: 0 });
                                            }}
                                        >
                                            <ListItemText inset>{relation.related_username}</ListItemText>
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
        </HideOnScroll>
    );
};
export default TicketsAppBar;
