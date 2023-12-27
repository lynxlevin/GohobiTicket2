import { useEffect, useContext } from 'react';
import { UserAPI } from '../apis/UserAPI';
import { UserContext } from '../contexts/user-context';

const useUserAPI = () => {
    const userContext = useContext(UserContext);

    const handleLogout = async () => {
        await UserAPI.logout();
        userContext.setIsLoggedIn(false);
    };

    useEffect(() => {
        const checkSession = async () => {
            const session_res = await UserAPI.session();
            const isAuthenticated = session_res.data.is_authenticated;
            userContext.setIsLoggedIn(isAuthenticated);
            // if (isAuthenticated) {
            //     // MYMEMO(後日): length ではなく、フラグを立てるべき
            //     if (wineTagContext.wineTagList.length === 0) {
            //         getWineTagList();
            //     }
            // }
        };
        void checkSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        handleLogout,
    };
};

export default useUserAPI;
