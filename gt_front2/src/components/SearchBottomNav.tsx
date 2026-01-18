import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePagePath from '../hooks/usePagePath';
import BaseBottomNav, { type NavItem } from './BaseBottomNav';

interface SearchBottomNavParams {
    selected?: NavItem;
    setSelected: React.Dispatch<React.SetStateAction<NavItem | undefined>>;
}

const SearchBottomNav = ({ selected, setSelected }: SearchBottomNavParams) => {
    const { userRelationId } = usePagePath();

    const handleSelect = (_: React.SyntheticEvent, newValue: NavItem) => {
        setSelected(newValue);
    };

    const navigate = useNavigate();

    const navActions = {
        giving_tickets: () => {
            navigate(`/user_relations/${userRelationId}/search?tab=giving_tickets`);
            window.scroll({ top: 0 });
        },
        receiving_tickets: () => {
            navigate(`/user_relations/${userRelationId}/search?tab=receiving_tickets`);
            window.scroll({ top: 0 });
        },
        diaries: () => {
            navigate(`/user_relations/${userRelationId}/search?tab=diaries`);
            window.scroll({ top: 0 });
        },
    };
    return <BaseBottomNav selectedNavItem={selected} handleSelect={handleSelect} navActions={navActions} />;
};
export default SearchBottomNav;
