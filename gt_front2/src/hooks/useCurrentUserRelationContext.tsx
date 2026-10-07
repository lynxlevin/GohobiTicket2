import { useContext } from 'react';
import { CurrentUserRelationContext } from '../contexts/current-user-relation-context';

const useCurrentUserRelationContext = () => {
    const currentUserRelationContext = useContext(CurrentUserRelationContext);

    const me = currentUserRelationContext.me;
    const currentUserRelation = currentUserRelationContext.currentUserRelation;
    const userRelations = currentUserRelationContext.userRelations;

    return {
        me,
        currentUserRelation,
        userRelations,
    };
};

export default useCurrentUserRelationContext;
