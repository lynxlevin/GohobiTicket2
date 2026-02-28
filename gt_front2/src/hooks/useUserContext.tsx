import { useContext } from 'react';
import { UserContext } from '../contexts/user-context';
import { UserAPI } from '../apis/UserAPI';

const useUserContext = () => {
    const userContext = useContext(UserContext);

    const me = userContext.me;

    const getMe = () => {
        UserAPI.session().then(res => {
            userContext.setMe(res.data);
        });
    };

    return {
        me,
        getMe,
    };
};

export default useUserContext;
