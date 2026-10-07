import { useContext } from 'react';
import { CurrentUserRelationContext } from '../contexts/current-user-relation-context';

const useCurrentUserRelationContext = () => {
    const currentUserRelationContext = useContext(CurrentUserRelationContext);

    const currentUserRelation = currentUserRelationContext.currentUserRelation;

    return {
        currentUserRelation,
    };
};

export default useCurrentUserRelationContext;
