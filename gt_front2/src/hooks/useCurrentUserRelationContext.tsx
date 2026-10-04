import { useContext } from 'react';
import { CurrentUserRelationContext } from '../contexts/current-user-relation-context';

const useCurrentUserRelationContext = () => {
    const currentUserRelationContext = useContext(CurrentUserRelationContext);

    const me = currentUserRelationContext.me;
    const currentUserRelation = currentUserRelationContext.currentUserRelation;

    return {
        me,
        currentUserRelation,
    };
};

export default useCurrentUserRelationContext;
