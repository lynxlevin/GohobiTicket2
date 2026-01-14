import { useCallback, useContext } from 'react';
import { UserRelationContext } from '../contexts/user-relation-context';
import { UserRelationAPI } from '../apis/UserRelationAPI';

const useUserRelationContext = () => {
    const userRelationContext = useContext(UserRelationContext);

    const userRelations = userRelationContext.userRelations;

    const getUserRelations = () => {
        UserRelationAPI.list().then(res => {
            userRelationContext.setUserRelations(res.data.user_relations);
        });
    };

    const clearUserRelations = useCallback(() => {
        userRelationContext.setUserRelations(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        userRelations,
        getUserRelations,
        clearUserRelations,
    };
};

export default useUserRelationContext;
