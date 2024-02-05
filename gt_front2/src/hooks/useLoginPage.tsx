import { useContext, useState } from 'react';
import { UserAPI } from '../apis/UserAPI';
import { UserContext } from '../contexts/user-context';
import { UserRelationAPI } from '../apis/UserRelationAPI';

const useLoginPage = () => {
    const userContext = useContext(UserContext);

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleEmailInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        setEmail(event.target.value);
    };

    const handlePasswordInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPassword(event.target.value);
    };

    const handleLogin = async () => {
        if (inputIsValid()) {
            setErrorMessage(null);
            try {
                await UserAPI.login({ email, password });
                const session_res = await UserAPI.session();
                userContext.setIsLoggedIn(session_res.data.is_authenticated);
                const defaultPage = session_res.data.default_page;
                userContext.setDefaultRelationId(defaultPage ? defaultPage.split('/')[2] : null);
            } catch (err: any) {
                setErrorMessage(err.response.data.detail);
            }
        }
    };

    const inputIsValid = () => {
        if (email === '') {
            setErrorMessage('Please input email.');
            return false;
        }
        if (password === '') {
            setErrorMessage('Please input password.');
            return false;
        }
        return true;
    };

    return {
        errorMessage,
        handleLogin,
        handleEmailInput,
        handlePasswordInput,
    };
};

export default useLoginPage;
