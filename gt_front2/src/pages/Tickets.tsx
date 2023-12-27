import { useContext } from 'react';
import { Alert, Button, TextField, Box, Typography, Container, CssBaseline } from '@mui/material';
import useLoginPage from '../hooks/useLoginPage';
import { Navigate } from 'react-router-dom';
import useUserAPI from '../hooks/useUserAPI';
import { UserContext } from '../contexts/user-context';

const Tickets = () => {
    const { handleLogout } = useUserAPI();
    const userContext = useContext(UserContext);
    const { errorMessage, handleLogin, handleEmailInput, handlePasswordInput } = useLoginPage();

    if (userContext.isLoggedIn !== true) {
        return <Navigate to="/login" />;
    }
    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Tickets
                </Typography>
                <Button onClick={handleLogout}>Logout</Button>
                <Box sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        onChange={handleEmailInput}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        onChange={handlePasswordInput}
                    />
                    <Button fullWidth variant="contained" onClick={handleLogin} sx={{ mt: 3, mb: 2 }}>
                        Sign In
                    </Button>
                    {errorMessage && (
                        <Alert severity="error" sx={{ mt: 3, mb: 2 }}>
                            {errorMessage}
                        </Alert>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default Tickets;
