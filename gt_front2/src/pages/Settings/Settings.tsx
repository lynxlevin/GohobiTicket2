import { Box, Container, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SecurityUpdateGoodIcon from '@mui/icons-material/SecurityUpdateGood';
import CommonAppBar from '../../components/CommonAppBar';
import BottomNav from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import useUserAPI from '../../hooks/useUserAPI';

const LIST_ITEM_MARGIN = 1.5;

const Settings = () => {
    const { handleLogout } = useUserAPI();

    return (
        <Container maxWidth="sm">
            <CommonAppBar />
            <Box color="rgba(0, 0, 0, 0.67)" pt={8}>
                <List>
                    <ListItem>
                        <Typography>バージョン: {process.env.REACT_APP_VERSION}</Typography>
                    </ListItem>
                    <NavigationListItem path="/settings/notifications" icon={<NotificationsIcon />} name="通知" />
                    <ButtonListItem onClick={() => window.location.reload()} icon={<SecurityUpdateGoodIcon />} name="アプリリロード" />
                    <ButtonListItem onClick={handleLogout} icon={<LogoutIcon />} name="ログアウト" />
                </List>
            </Box>
            <BottomNav />
        </Container>
    );
};

const NavigationListItem = ({ path, icon, name }: { path: string; icon: JSX.Element; name: string }) => {
    const navigate = useNavigate();
    return (
        <ListItemButton
            sx={{ marginBottom: LIST_ITEM_MARGIN }}
            onClick={() => {
                navigate(path);
                window.scroll({ top: 0 });
            }}
        >
            <ListItemAvatar sx={{ lineHeight: '1em' }}>{icon}</ListItemAvatar>
            <ListItemText>{name}</ListItemText>
            <ChevronRightIcon />
        </ListItemButton>
    );
};

const ButtonListItem = ({ onClick, icon, name }: { onClick: () => void; icon: JSX.Element; name: string }) => {
    return (
        <ListItemButton sx={{ marginBottom: LIST_ITEM_MARGIN }} onClick={onClick}>
            <ListItemAvatar sx={{ lineHeight: '1em' }}>{icon}</ListItemAvatar>
            <ListItemText>{name}</ListItemText>
        </ListItemButton>
    );
};

export default Settings;
