import { useState } from 'react';
import './App.css';
import { Link, Routes, Route } from 'react-router-dom';
import { UserContext } from './contexts/user-context';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Login from './pages/Login';
import Tickets from './pages/Tickets/Tickets';
import ja from 'date-fns/locale/ja';

const theme = createTheme({
    palette: {
        primary: {
            main: '#3dd4cf',
        },
        secondary: {
            main: '#009ef1',
        },
    },
});

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [defaultRelationId, setDefaultRelationId] = useState<string | null>(null);

    return (
        <div className="App">
            <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn, defaultRelationId, setDefaultRelationId }}>
                <ThemeProvider theme={theme}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja} dateFormats={{keyboardDate: 'yyyy/MM/dd (E)', normalDate: 'yyyy/MM/dd (E)'}}>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <>
                                        <p></p>
                                        <Link to="/login">Login</Link>
                                        <p></p>
                                        <Link to="/tickets?user_relation_id=1">Tickets</Link>
                                    </>
                                }
                            />
                            <Route path="/login" element={<Login />} />
                            <Route path="/tickets" element={<Tickets />} />
                        </Routes>
                    </LocalizationProvider>
                </ThemeProvider>
            </UserContext.Provider>
        </div>
    );
}

export default App;
