import ExpandMore from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import SellIcon from '@mui/icons-material/Sell';
import SecurityUpdateGoodIcon from '@mui/icons-material/SecurityUpdateGood';
import { AppBar, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Slide, Toolbar, useScrollTrigger } from '@mui/material';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IUserRelation, RelationKind, UserRelationContext } from '../../contexts/user-relation-context';

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
    currentRelation: IUserRelation;
    refreshDiaries: () => void;
    relationKind?: RelationKind;
}

const DiariesAppBar = ({ handleLogout, currentRelation, refreshDiaries }: DiariesAppBarProps) => {
    const userRelationContext = useContext(UserRelationContext);
    const [topBarDrawerOpen, setTopBarDrawerOpen] = useState(false);
    const navigate = useNavigate();

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
                                        navigate(`/user_relations/${currentRelation.id}/diary_tags`);
                                    }}
                                >
                                    <ListItemIcon>
                                        <SellIcon />
                                    </ListItemIcon>
                                    <ListItemText>タグ編集</ListItemText>
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
                                                // MYMEMO: This should be clearDiaries
                                                refreshDiaries();
                                                navigate(`/user_relations/${relation.id}/diaries`);
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
