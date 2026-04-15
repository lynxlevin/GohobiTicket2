import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePagePath from '../hooks/usePagePath';
import BaseBottomNav, { type NavItem } from './BaseBottomNav';
import useUserRelationContext from '../hooks/useUserRelationContext';

const BottomNav = () => {
    const { userRelationId: pathUserRelationId, pagePath } = usePagePath();
    const { userRelations } = useUserRelationContext();

    const [selected, setSelected] = useState<NavItem>();
    const handleSelect = (_: React.SyntheticEvent, newValue: NavItem) => {
        setSelected(newValue);
    };

    const navigate = useNavigate();
    const userRelationId = pathUserRelationId === null ? (userRelations === undefined ? undefined : userRelations[0].id) : pathUserRelationId;

    const navActions = {
        giving_tickets: () => {
            const url = userRelationId !== undefined ? `/user_relations/${pathUserRelationId ?? userRelations![0].id}/giving_tickets` : '/login';
            navigate(url);
            window.scroll({ top: 0 });
        },
        receiving_tickets: () => {
            const url = userRelationId !== undefined ? `/user_relations/${pathUserRelationId ?? userRelations![0].id}/receiving_tickets` : '/login';
            navigate(url);
            window.scroll({ top: 0 });
        },
        wishes: () => {
            const url = userRelationId !== undefined ? `/user_relations/${pathUserRelationId ?? userRelations![0].id}/wishes` : '/login';
            navigate(url);
            window.scroll({ top: 0 });
        },
        diaries: () => {
            const url = userRelationId !== undefined ? `/user_relations/${pathUserRelationId ?? userRelations![0].id}/diaries` : '/login';
            navigate(url);
            window.scroll({ top: 0 });
        },
    };

    useEffect(() => {
        setSelected(pagePath === 'search' ? undefined : pagePath);
    }, [pagePath]);
    return <BaseBottomNav selectedNavItem={selected} handleSelect={handleSelect} navActions={navActions} />;
};
export default BottomNav;
