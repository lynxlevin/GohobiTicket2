import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ja from 'date-fns/locale/ja';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { DiaryTagProvider } from './contexts/diary-tag-context';
import { TicketProvider } from './contexts/ticket-context';
import { UserRelationProvider } from './contexts/user-relation-context';
import Diaries from './pages/Diaries';
import DiaryTags from './pages/DiaryTags';
import Login from './pages/Login';
import Tickets from './pages/Tickets';
import { DiaryProvider } from './contexts/diary-context';
import Search from './pages/Search';
import { UserProvider } from './contexts/user-context';
import NotificationSettings from './pages/Settings/NotificationSettings';
import Wishes from './pages/Tickets/Wishes';
import { LocalStorageProvider } from './contexts/local-storage-context';
import { YearMonthProvider } from './contexts/year-month-context';
import Wish from './pages/Tickets/Wish';
import Settings from './pages/Settings/Settings';
import { WishProvider } from './contexts/wish-context';
import { GlobalErrorProvider } from './contexts/global-error-context';
import useGlobalErrorContext from './hooks/useGlobalErrorContext';
import { Snackbar } from '@mui/material';

const theme = createTheme({
    palette: {
        primary: {
            main: '#60C8C7',
            // main: '#47BFBE',  // Logo blue-green color.
        },
        secondary: {
            main: '#009ef1', // Logo blue color.
        },
    },
});

function App() {
    return (
        <div className="App">
            <UserProvider>
                <UserRelationProvider>
                    <YearMonthProvider>
                        <TicketProvider>
                            <WishProvider>
                                <DiaryTagProvider>
                                    <DiaryProvider>
                                        <LocalStorageProvider>
                                            <GlobalErrorProvider>
                                                <ThemeProvider theme={theme}>
                                                    <Router />
                                                </ThemeProvider>
                                            </GlobalErrorProvider>
                                        </LocalStorageProvider>
                                    </DiaryProvider>
                                </DiaryTagProvider>
                            </WishProvider>
                        </TicketProvider>
                    </YearMonthProvider>
                </UserRelationProvider>
            </UserProvider>
        </div>
    );
}

const Router = () => {
    const { globalErrors, removeGlobalErrors } = useGlobalErrorContext();

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja} dateFormats={{ keyboardDate: 'yyyy/MM/dd (E)', normalDate: 'yyyy/MM/dd (E)' }}>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/user_relations/:userRelationId/receiving_tickets" element={<Tickets relationKind="Receiving" />} />
                <Route path="/user_relations/:userRelationId/giving_tickets" element={<Tickets relationKind="Giving" />} />
                <Route path="/user_relations/:userRelationId/wishes" element={<Wishes />} />
                <Route path="/user_relations/:userRelationId/wishes/:wishId" element={<Wish />} />
                <Route path="/user_relations/:userRelationId/diaries" element={<Diaries />} />
                <Route path="/user_relations/:userRelationId/search" element={<Search />} />
                <Route path="/user_relations/:userRelationId/diary_tags" element={<DiaryTags />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/notifications" element={<NotificationSettings />} />
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

export default App;
