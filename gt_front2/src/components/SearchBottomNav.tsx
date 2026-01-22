import React from 'react';
import { useSearchParams } from 'react-router-dom';
import BaseBottomNav, { BottomNavBadges, type NavItem } from './BaseBottomNav';

interface SearchBottomNavParams {
    selected?: NavItem;
    setSelected: React.Dispatch<React.SetStateAction<NavItem | undefined>>;
    badges: BottomNavBadges;
}

const SearchBottomNav = ({ selected, setSelected, badges }: SearchBottomNavParams) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_searchParams, setSearchParams] = useSearchParams();

    const handleSelect = (_: React.SyntheticEvent, newValue: NavItem) => {
        setSelected(newValue);
    };

    const navActions = {
        giving_tickets: () => {
            setSearchParams({ tab: 'giving_tickets' });
            window.scroll({ top: 0 });
        },
        receiving_tickets: () => {
            setSearchParams({ tab: 'receiving_tickets' });
            window.scroll({ top: 0 });
        },
        diaries: () => {
            setSearchParams({ tab: 'diaries' });
            window.scroll({ top: 0 });
        },
    };
    return <BaseBottomNav selectedNavItem={selected} handleSelect={handleSelect} navActions={navActions} badges={badges} />;
};
export default SearchBottomNav;
