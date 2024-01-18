import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ja from 'date-fns/locale/ja';
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { IDiaryTag } from './contexts/diary-tag-context';
import { DiaryTagContext } from './contexts/diary-tag-context';
import { ITicket } from './contexts/ticket-context';
import { TicketContext } from './contexts/ticket-context';
import { UserContext } from './contexts/user-context';
import { UserRelationContext } from './contexts/user-relation-context';
import { IUserRelation } from './contexts/user-relation-context';
import Diaries from './pages/Diaries';
import Login from './pages/Login';
import Tickets from './pages/Tickets';

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
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [defaultRelationId, setDefaultRelationId] = useState<string | null>(null);
    const [userRelations, setUserRelations] = useState<IUserRelation[]>([]);
    const [tickets, setTickets] = useState<ITicket[]>([]);
    const [diaryTags, setDiaryTags] = useState<IDiaryTag[] | null>(null);

    return (
        <div className='App' style={{ backgroundColor: 'rgb(250, 255, 255)' }}>
            <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn, defaultRelationId, setDefaultRelationId }}>
                <UserRelationContext.Provider value={{ userRelations, setUserRelations }}>
                    <TicketContext.Provider value={{ tickets, setTickets }}>
                        <DiaryTagContext.Provider value={{ diaryTags, setDiaryTags }}>
                            <ThemeProvider theme={theme}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                    adapterLocale={ja}
                                    dateFormats={{ keyboardDate: 'yyyy/MM/dd (E)', normalDate: 'yyyy/MM/dd (E)' }}
                                >
                                    <Routes>
                                        <Route path='/' element={<Login />} />
                                        <Route path='/login' element={<Login />} />
                                        <Route path='/tickets' element={<Tickets />} />
                                        <Route path='/diaries' element={<Diaries />} />
                                    </Routes>
                                </LocalizationProvider>
                            </ThemeProvider>
                        </DiaryTagContext.Provider>
                    </TicketContext.Provider>
                </UserRelationContext.Provider>
            </UserContext.Provider>
        </div>
    );
}

export default App;
