import { UserAPI } from '../apis/UserAPI';
import useDiaryContext from './useDiaryContext';
import useDiaryTagContext from './useDiaryTagContext';
import useGlobalErrorContext from './useGlobalErrorContext';
import useTicketContext from './useTicketContext';
import useUserRelationContext from './useUserRelationContext';
import useWishContext from './useWishContext';

const useUserAPI = () => {
    const { clearTicketCache } = useTicketContext();
    const { clearDiaryCache } = useDiaryContext();
    const { clearDiaryTagCache } = useDiaryTagContext();
    const { clearUserRelations } = useUserRelationContext();
    const { clearWishCache } = useWishContext();
    const { handleAPIError } = useGlobalErrorContext();

    const clearAllCache = () => {
        clearTicketCache();
        clearDiaryCache();
        clearDiaryTagCache();
        clearUserRelations();
        clearWishCache();
    };

    const handleLogout = async () => {
        await UserAPI.logout().catch(handleAPIError);
        if (window.location.pathname !== '/login') window.location.pathname = '/login';
    };

    return {
        clearAllCache,
        handleLogout,
    };
};

export default useUserAPI;
