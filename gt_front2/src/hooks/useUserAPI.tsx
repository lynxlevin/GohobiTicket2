import { useEffect, useContext } from 'react';
import { UserAPI } from '../apis/UserAPI';
import { UserContext } from '../contexts/user-context';
import { UserRelationContext } from '../contexts/user-relation-context';
import { UserRelationAPI } from '../apis/UserRelationAPI';

const useUserAPI = () => {
    const userContext = useContext(UserContext);
    const userRelationContext = useContext(UserRelationContext);

    const handleLogout = async () => {
        await UserAPI.logout();
        userContext.setIsLoggedIn(false);
        userContext.setDefaultRelationId(null);
    };

    useEffect(() => {
        const checkSession = async () => {
            const session_res = await UserAPI.session();
            const isAuthenticated = session_res.data.is_authenticated;
            userContext.setIsLoggedIn(isAuthenticated);
            const defaultPage = session_res.data.default_page;
            userContext.setDefaultRelationId(defaultPage ? defaultPage.split('/')[2] : null);
            if (isAuthenticated) {
                // MYMEMO: この方法だと、別ユーザーでログインしたときに再取得されない
                if (userRelationContext.userRelations.length === 0) {
                    const res = await UserRelationAPI.list();
                    userRelationContext.setUserRelations(res.data.user_relations);
                }
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
