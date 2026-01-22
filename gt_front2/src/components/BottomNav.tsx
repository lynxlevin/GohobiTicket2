import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePagePath from '../hooks/usePagePath';
import BaseBottomNav, { type NavItem } from './BaseBottomNav';

const BottomNav = () => {
    const { userRelationId, pagePath } = usePagePath();

    const [selected, setSelected] = useState<NavItem>();
    const handleSelect = (_: React.SyntheticEvent, newValue: NavItem) => {
        setSelected(newValue);
    };

    const navigate = useNavigate();

    const navActions = {
        giving_tickets: () => {
            navigate(`/user_relations/${userRelationId}/giving_tickets`);
            window.scroll({ top: 0 });
        },
        receiving_tickets: () => {
            navigate(`/user_relations/${userRelationId}/receiving_tickets`);
            window.scroll({ top: 0 });
        },
        diaries: () => {
            navigate(`/user_relations/${userRelationId}/diaries`);
            window.scroll({ top: 0 });
        },
    };

    useEffect(() => {
        setSelected(pagePath === 'search' ? undefined : pagePath);
    }, [pagePath]);
    return <BaseBottomNav selectedNavItem={selected} handleSelect={handleSelect} navActions={navActions} />;
};
export default BottomNav;
