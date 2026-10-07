import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import { DiaryTagProvider } from './contexts/diary-tag-context';
import { TicketProvider } from './contexts/ticket-context';
import { UserRelationProvider } from './contexts/user-relation-context';
import { DiaryProvider } from './contexts/diary-context';
import { UserProvider } from './contexts/user-context';
import { LocalStorageProvider } from './contexts/local-storage-context';
import { YearMonthProvider } from './contexts/year-month-context';
import { WishProvider } from './contexts/wish-context';
import { GlobalErrorProvider } from './contexts/global-error-context';
import AppRouter from './AppRouter';

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
                                                    <AppRouter />
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

export default App;
