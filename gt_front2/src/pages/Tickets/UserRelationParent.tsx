import { CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import useUserRelationContext from '../../hooks/useUserRelationContext';
import usePagePath from '../../hooks/usePagePath';
import useUserContext from '../../hooks/useUserContext';
import { Outlet } from 'react-router-dom';
import { CurrentUserRelationContext } from '../../contexts/current-user-relation-context';

const UserRelationParent = () => {
    const { me, getMe } = useUserContext();
    const { getUserRelations, userRelations } = useUserRelationContext();
    const { userRelationId } = usePagePath();

    const currentUserRelation = userRelations?.find(relation => Number(relation.id) === userRelationId);

    useEffect(() => {
        if (me === undefined) getMe();
    }, [getMe, me]);

    useEffect(() => {
        if (userRelations === undefined) getUserRelations();
    }, [getUserRelations, userRelations]);

    return currentUserRelation === undefined || userRelations === undefined || me === undefined ? (
        <CircularProgress />
    ) : (
        <>
            <CurrentUserRelationContext.Provider value={{ me, currentUserRelation, userRelations }}>
                <Outlet />
            </CurrentUserRelationContext.Provider>
        </>
    );
};

export default UserRelationParent;
