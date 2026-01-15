import { UserAPI } from '../apis/UserAPI';
import useDiaryContext from './useDiaryContext';
import useDiaryTagContext from './useDiaryTagContext';
import useTicketContext from './useTicketContext';
import useUserRelationContext from './useUserRelationContext';

const useUserAPI = () => {
    const { clearTicketCache } = useTicketContext();
    const { clearDiaryCache } = useDiaryContext();
    const { clearDiaryTagCache } = useDiaryTagContext();
    const { clearUserRelations } = useUserRelationContext();

    const clearAllCache = () => {
        clearTicketCache();
        clearDiaryCache();
        clearDiaryTagCache();
        clearUserRelations();
    };

    const handleLogout = async () => {
        await UserAPI.logout();
        if (window.location.pathname !== '/login') window.location.pathname = '/login';
    };

    return {
        clearAllCache,
        handleLogout,
    };
};

export default useUserAPI;
