import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react';
import { IWish, IWishWithReplies } from '../types/ticket';

interface WishPage {
    currentPage: number;
    totalPageCount: number;
}
interface WishContextType {
    wishes: IWish[] | undefined;
    page: WishPage | undefined;
    currentWish: IWishWithReplies | undefined;
    setWishes: Dispatch<SetStateAction<IWish[] | undefined>>;
    setPage: Dispatch<SetStateAction<WishPage | undefined>>;
    setCurrentWish: Dispatch<SetStateAction<IWishWithReplies | undefined>>;
}

export const WishContext = createContext<WishContextType>({
    wishes: undefined,
    page: undefined,
    currentWish: undefined,
    setWishes: () => {},
    setPage: () => {},
    setCurrentWish: () => {},
});

export const WishProvider = ({ children }: { children: ReactNode }) => {
    const [wishes, setWishes] = useState<IWish[]>();
    const [page, setPage] = useState<WishPage>();
    const [currentWish, setCurrentWish] = useState<IWishWithReplies>();

    return (
        <WishContext.Provider
            value={{
                wishes,
                page,
                currentWish,
                setWishes,
                setPage,
                setCurrentWish,
            }}
        >
            {children}
        </WishContext.Provider>
    );
};
