import { useContext, useState } from 'react';
import { UserAPI } from '../apis/UserAPI';
import { UserRelationAPI } from '../apis/UserRelationAPI';
import { UserRelationContext } from '../contexts/user-relation-context';

const useLoginPage = () => {
    const userRelationContext = useContext(UserRelationContext);

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>();

    const handleEmailInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        setEmail(event.target.value);
    };

    const handlePasswordInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPassword(event.target.value);
    };

    const handleLogin = async () => {
        if (!inputIsValid()) return;

        setErrorMessage(null);
        UserAPI.login({ email, password })
            .then(() => {
                setIsLoggedIn(true);
                UserRelationAPI.list().then(res => userRelationContext.setUserRelations(res.data.user_relations));
            })
            .catch(err => setErrorMessage(err.response.data.detail));
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
        isLoggedIn,
        setIsLoggedIn,
        errorMessage,
        handleLogin,
        handleEmailInput,
        handlePasswordInput,
    };
};

export default useLoginPage;
