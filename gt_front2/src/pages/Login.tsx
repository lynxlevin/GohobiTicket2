import { Alert, Box, Button, Container, CssBaseline, TextField, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import useLoginPage from '../hooks/useLoginPage';
import useUserAPI from '../hooks/useUserAPI';
import useUserRelationContext from '../hooks/useUserRelationContext';
import { UserAPI } from '../apis/UserAPI';

const Login = () => {
    useUserAPI();
    const [searchParams] = useSearchParams();
    const { errorMessage, handleLogin, handleEmailInput, handlePasswordInput, isLoggedIn, setIsLoggedIn } = useLoginPage();
    const { userRelations, getUserRelations } = useUserRelationContext();
    const { clearAllCache } = useUserAPI();

    useEffect(() => {
        if (isLoggedIn !== undefined) return;
        UserAPI.session()
            .then(_ => {
                setIsLoggedIn(true);
                clearAllCache();
                getUserRelations();
            })
            .catch(_ => {
                setIsLoggedIn(false);
            });
    }, [clearAllCache, getUserRelations, isLoggedIn, setIsLoggedIn, userRelations]);

    if (isLoggedIn === true && userRelations !== undefined) {
        const firstRelationId = userRelations[0].id;
        const toQuery = searchParams.get('to');
        let path = '';
        switch (toQuery) {
            case 'giving_tickets':
                path = `/user_relations/${firstRelationId}/giving_tickets`
                break;
            case 'receiving_tickets':
            case null:
                path = `/user_relations/${firstRelationId}/receiving_tickets`
                break;
            case 'wishes':
                path = `/user_relations/${firstRelationId}/wishes`
                break;
            case 'diaries':
                path = `/user_relations/${firstRelationId}/diaries`
                break;
        }
        return <Navigate to={path} />;
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
