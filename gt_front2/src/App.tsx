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
            <UserRelationProvider>
                <TicketProvider>
                    <DiaryTagProvider>
                        <DiaryProvider>
                            <ThemeProvider theme={theme}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                    adapterLocale={ja}
                                    dateFormats={{ keyboardDate: 'yyyy/MM/dd (E)', normalDate: 'yyyy/MM/dd (E)' }}
                                >
                                    <Routes>
                                        <Route path="/" element={<Login />} />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/user_relations/:userRelationId/receiving_tickets" element={<Tickets relationKind="Receiving" />} />
                                        <Route path="/user_relations/:userRelationId/giving_tickets" element={<Tickets relationKind="Giving" />} />
                                        <Route path="/user_relations/:userRelationId/diaries" element={<Diaries />} />
                                        <Route path="/user_relations/:userRelationId/diary_tags" element={<DiaryTags />} />
                                    </Routes>
                                </LocalizationProvider>
                            </ThemeProvider>
                        </DiaryProvider>
                    </DiaryTagProvider>
                </TicketProvider>
            </UserRelationProvider>
        </div>
    );
}

export default App;
