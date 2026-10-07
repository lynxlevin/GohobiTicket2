import { useContext } from 'react';
import { CurrentUserContext } from '../contexts/current-user-context';

const useCurrentUserContext = () => {
    const currentUserContext = useContext(CurrentUserContext);

    const me = currentUserContext.me;
    const userRelations = currentUserContext.userRelations;

    return {
        me,
        userRelations,
    };
};

export default useCurrentUserContext;
