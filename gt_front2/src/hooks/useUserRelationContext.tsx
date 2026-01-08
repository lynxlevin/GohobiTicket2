import { useCallback, useContext } from 'react';
import { UserRelationContext } from '../contexts/user-relation-context';

const useUserRelationContext = () => {
    const userRelationContext = useContext(UserRelationContext);

    const userRelations = userRelationContext.userRelations;

    const clearUserRelations = useCallback(() => {
        userRelationContext.setUserRelations(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        userRelations,
        clearUserRelations,
    };
};

export default useUserRelationContext;
