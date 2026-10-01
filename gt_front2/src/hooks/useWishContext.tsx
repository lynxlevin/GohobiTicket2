import { useCallback, useContext } from 'react';
import { WishContext } from '../contexts/wish-context';
import { WishAPI } from '../apis/WishAPI';
import { WishReplyAPI } from '../apis/WishReplyAPI';
import useGlobalErrorContext from './useGlobalErrorContext';

const useWishContext = () => {
    const WISH_PAGE_SIZE = 10;

    const wishContext = useContext(WishContext);
    const { handleAPIError, handleAPIErrorThrowing } = useGlobalErrorContext();

    const wishes = wishContext.wishes;
    const page = wishContext.page;
    const currentWish = wishContext.currentWish;

    const getWishes = useCallback(
        async (userRelationId: number, pageInput: number) => {
            const page = pageInput - 1;
            WishAPI.list(userRelationId, page, WISH_PAGE_SIZE)
                .then(({ data: { wishes, page_count } }) => {
                    wishContext.setWishes(wishes);
                    wishContext.setPage({ currentPage: pageInput, totalPageCount: page_count! });
                })
                .catch(handleAPIError);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [wishContext.setWishes],
    );
    const getCurrentWish = useCallback(
        async (userRelationId: number, wishId: string) => {
            WishAPI.get(userRelationId, wishId)
                .then(({ data: wish }) => {
                    wishContext.setCurrentWish(wish);
                })
                .catch(handleAPIError);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [wishContext.setCurrentWish],
    );

    const updateReactions = async (userRelationId: number, wishId: string, reactions: string) => {
        await WishAPI.updateReactions(userRelationId, wishId, reactions)
            .then(_ => {
                if (wishes !== undefined) {
                    wishContext.setWishes(prev => {
                        const toBe = [...prev!];
                        const wish = toBe.find(w => w.id === wishId);
                        if (wish !== undefined) wish.reactions = reactions;
                        return toBe;
                    });
                }
                if (currentWish !== undefined) {
                    wishContext.setCurrentWish(prev => {
                        return { ...prev!, reactions };
                    });
                }
            })
            .catch(handleAPIErrorThrowing);
    };

    const reply = async (userRelationId: number, wishId: string, description: string) => {
        await WishAPI.reply(userRelationId, wishId, description)
            .then(_ => {
                if (wishes !== undefined) {
                    wishContext.setWishes(prev => {
                        const toBe = [...prev!];
                        const wish = toBe.find(w => w.id === wishId);
                        if (wish !== undefined) wish.has_replies = true;
                        return toBe;
                    });
                }
                if (currentWish !== undefined) {
                    getCurrentWish(userRelationId, wishId);
                }
            })
            .catch(handleAPIErrorThrowing);
    };

    const updateReplyReactions = async (userRelationId: number, wishReplyId: string, reactions: string, wishId: string) => {
        await WishReplyAPI.updateReactions(userRelationId, wishReplyId, reactions)
            .then(_ => {
                if (currentWish !== undefined && currentWish.id === wishId) {
                    wishContext.setCurrentWish(prev => {
                        const toBe = { ...prev! };
                        const reply = toBe.replies.find(r => r.id === wishReplyId);
                        if (reply === undefined) return undefined;
                        reply.reactions = reactions;
                        return toBe;
                    });
                }
            })
            .catch(handleAPIErrorThrowing);
    };

    const clearCurrentWish = useCallback(() => {
        wishContext.setCurrentWish(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const clearWishCache = useCallback(() => {
        wishContext.setWishes(undefined);
        wishContext.setPage(undefined);
        wishContext.setCurrentWish(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        wishes,
        currentPage: page?.currentPage,
        totalPageCount: page?.totalPageCount,
        currentWish,
        getWishes,
        getCurrentWish,
        updateReactions,
        reply,
        updateReplyReactions,
        clearCurrentWish,
        clearWishCache,
    };
};

export default useWishContext;
