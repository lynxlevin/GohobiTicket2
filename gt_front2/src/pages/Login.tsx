import { Alert, Box, Button, Container, CssBaseline, TextField, Typography } from '@mui/material';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../contexts/user-context';
import useLoginPage from '../hooks/useLoginPage';
import useUserAPI from '../hooks/useUserAPI';
import useUserRelationContext from '../hooks/useUserRelationContext';

const Login = () => {
    useUserAPI();
    const userContext = useContext(UserContext);
    const { errorMessage, handleLogin, handleEmailInput, handlePasswordInput } = useLoginPage();

    const { userRelations } = useUserRelationContext();

    if (userContext.isLoggedIn === true && userRelations !== undefined) {
        const firstRelationId = userRelations[0].id;
        return <Navigate to={`/user_relations/${firstRelationId}/receiving_tickets`} />;
    }
    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    pt: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
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

export default Login;
