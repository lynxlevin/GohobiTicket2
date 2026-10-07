import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ja from 'date-fns/locale/ja';
import { Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Diaries from './pages/Diaries';
import DiaryTags from './pages/DiaryTags';
import Login from './pages/Login';
import Tickets from './pages/Tickets';
import Search from './pages/Search';
import NotificationSettings from './pages/Settings/NotificationSettings';
import Wishes from './pages/Tickets/Wishes';
import Wish from './pages/Tickets/Wish';
import Settings from './pages/Settings/Settings';
import useGlobalErrorContext from './hooks/useGlobalErrorContext';
import { CircularProgress, Snackbar } from '@mui/material';
import UserRelationParent from './pages/Tickets/UserRelationParent';
import useUserContext from './hooks/useUserContext';
import useUserRelationContext from './hooks/useUserRelationContext';
import { useEffect } from 'react';
import { CurrentUserContext } from './contexts/current-user-context';

const AppRouter = () => {
    const { globalErrors, removeGlobalErrors } = useGlobalErrorContext();

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja} dateFormats={{ keyboardDate: 'yyyy/MM/dd (E)', normalDate: 'yyyy/MM/dd (E)' }}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="" element={<AuthenticatedRoutes />}>
                    <Route path="/user_relations/:userRelationId" element={<UserRelationParent />}>
                        <Route path="receiving_tickets" element={<Tickets relationKind="Receiving" />} />
                        <Route path="giving_tickets" element={<Tickets relationKind="Giving" />} />
                        <Route path="wishes" element={<Wishes />} />
                        <Route path="wishes/:wishId" element={<Wish />} />
                        <Route path="diaries" element={<Diaries />} />
                        <Route path="diary_tags" element={<DiaryTags />} />
                        <Route path="search" element={<Search />} />
                    </Route>
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/settings/notifications" element={<NotificationSettings />} />
                </Route>
            </Routes>
            {globalErrors.map((e, i) => (
                <Snackbar
                    key={i}
                    open
                    message={e.message}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    autoHideDuration={e.autoHideDurationMS}
                    onClose={() => e.autoHideDurationMS !== undefined && removeGlobalErrors(e)}
                    sx={{ mb: (i + 1) * 7 }}
                />
            ))}
        </LocalizationProvider>
    );
};

const AuthenticatedRoutes = () => {
    const { me, getMe } = useUserContext();
    const { getUserRelations, userRelations } = useUserRelationContext();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (me === undefined) getMe();
    }, [getMe, me]);

    useEffect(() => {
        if (userRelations === undefined) getUserRelations();
    }, [getUserRelations, userRelations]);

    useEffect(() => {
        if (userRelations === undefined) return;
        const pathParts = pathname.split('/');
        const firstRelationId = userRelations[0].id;
        if (pathParts[0] === '' && pathParts[1] === '') {
            navigate(`/user_relations/${firstRelationId}/receiving_tickets`);
        }
    }, [navigate, pathname, userRelations]);
    return userRelations === undefined || me === undefined ? (
        <CircularProgress />
    ) : (
        <CurrentUserContext.Provider value={{ me, userRelations }}>
            <Outlet />
        </CurrentUserContext.Provider>
    );
};

export default AppRouter;
