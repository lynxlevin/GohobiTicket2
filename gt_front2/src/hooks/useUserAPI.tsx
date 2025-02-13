import { useContext, useEffect } from 'react';
import { UserAPI } from '../apis/UserAPI';
import { UserRelationAPI } from '../apis/UserRelationAPI';
import { UserContext } from '../contexts/user-context';
import { UserRelationContext } from '../contexts/user-relation-context';

const useUserAPI = () => {
    const userContext = useContext(UserContext);
    const userRelationContext = useContext(UserRelationContext);

    const handleLogout = async () => {
        await UserAPI.logout();
        userContext.setIsLoggedIn(false);
        userRelationContext.setUserRelations([]);
    };

    useEffect(() => {
        const checkSession = async () => {
            const session_res = await UserAPI.session();
            const isAuthenticated = session_res.data.is_authenticated;
            userContext.setIsLoggedIn(isAuthenticated);
            if (isAuthenticated) {
                if (userRelationContext.userRelations.length === 0) {
                    const res = await UserRelationAPI.list();
                    userRelationContext.setUserRelations(res.data.user_relations);
                }
            } else {
                userRelationContext.setUserRelations([]);
            }
        };
        void checkSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        handleLogout,
    };
};

export default useUserAPI;
