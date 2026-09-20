import { useContext } from 'react';
import { UserContext } from '../contexts/user-context';
import { UserAPI } from '../apis/UserAPI';
import useGlobalErrorContext from './useGlobalErrorContext';

const useUserContext = () => {
    const userContext = useContext(UserContext);
    const { handleAPIError } = useGlobalErrorContext();

    const me = userContext.me;

    const getMe = () => {
        UserAPI.session()
            .then(res => {
                userContext.setMe(res.data);
            })
            .catch(handleAPIError);
    };

    return {
        me,
        getMe,
    };
};

export default useUserContext;
