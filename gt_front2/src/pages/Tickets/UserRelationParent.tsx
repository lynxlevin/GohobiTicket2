import { CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import usePagePath from '../../hooks/usePagePath';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CurrentUserRelationContext } from '../../contexts/current-user-relation-context';
import useCurrentUserContext from '../../hooks/useCurrentUserContext';

const UserRelationParent = () => {
    const { userRelationId } = usePagePath();
    const { userRelations } = useCurrentUserContext();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const currentUserRelation = userRelations?.find(relation => Number(relation.id) === userRelationId);

    useEffect(() => {
        const pathParts = pathname.split('/');
        if (pathParts.length === 3 || pathParts[3] === '') {
            navigate(`${pathname}/receiving_tickets`);
        }
    }, [navigate, pathname]);
    return currentUserRelation === undefined ? (
        <CircularProgress />
    ) : (
        <CurrentUserRelationContext.Provider value={{ currentUserRelation }}>
            <Outlet />
        </CurrentUserRelationContext.Provider>
    );
};

export default UserRelationParent;
