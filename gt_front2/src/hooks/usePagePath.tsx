import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

export type PagePath = 'giving_tickets' | 'receiving_tickets' | 'diaries' | 'search';
const usePagePath = () => {
    const pathParams = useParams();
    const location = useLocation();

    const userRelationId = useMemo(() => {
        return Number(pathParams.userRelationId);
    }, [pathParams.userRelationId]);

    const pagePath = useMemo(() => {
        return location.pathname.split('/').at(-1) as PagePath;
    }, [location.pathname]);

    return {
        userRelationId,
        pagePath,
    };
};

export default usePagePath;
