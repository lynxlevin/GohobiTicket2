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
            UserAPI.session().then(_ => {
                userContext.setIsLoggedIn(true);
                if (userRelationContext.userRelations.length === 0) {
                    UserRelationAPI.list().then(res => {
                        userRelationContext.setUserRelations(res.data.user_relations);
                    });
                }
            }).catch(e => {
                if (e.response.status_code === 401) {
                    userContext.setIsLoggedIn(false);
                    userRelationContext.setUserRelations([]);
                }
            });
        };
        void checkSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        handleLogout,
    };
};

export default useUserAPI;
