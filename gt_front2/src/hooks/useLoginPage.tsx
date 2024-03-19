import { useContext, useState } from 'react';
import { UserAPI } from '../apis/UserAPI';
import { UserRelationAPI } from '../apis/UserRelationAPI';
import { UserContext } from '../contexts/user-context';
import { UserRelationContext } from '../contexts/user-relation-context';

const useLoginPage = () => {
    const userContext = useContext(UserContext);
    const userRelationContext = useContext(UserRelationContext);

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
                const isAuthenticated = session_res.data.is_authenticated;
                userContext.setIsLoggedIn(isAuthenticated);
                if (isAuthenticated) {
                    // MYMEMO: この方法だと、別ユーザーでログインしたときに再取得されない
                    if (userRelationContext.userRelations.length === 0) {
                        const res = await UserRelationAPI.list();
                        userRelationContext.setUserRelations(res.data.user_relations);
                    }
                }
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
