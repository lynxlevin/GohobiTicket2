import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

export type PagePath = 'giving_tickets' | 'receiving_tickets' | 'diaries' | 'search';
const usePagePath = () => {
    const pathParams = useParams();
    const location = useLocation();

    const userRelationId = useMemo((): number | null => {
        const userRelationId = Number(pathParams.userRelationId);
        return isNaN(userRelationId) ? null : userRelationId;
    }, [pathParams.userRelationId]);

    const wishId = useMemo((): string | null => {
        return pathParams.wishId ?? null;
    }, [pathParams.wishId]);

    const pagePath = useMemo(() => {
        return location.pathname.split('/').at(-1) as PagePath;
    }, [location.pathname]);

    return {
        userRelationId,
        wishId,
        pagePath,
    };
};

export default usePagePath;
