import { createContext, ReactNode, useState } from 'react';
import { IWish, IWishWithReplies } from '../types/ticket';
interface WishContextType {
    wishes: IWish[] | undefined;
    currentWish: IWishWithReplies | undefined;
    setWishes: React.Dispatch<React.SetStateAction<IWish[] | undefined>>;
    setCurrentWish: React.Dispatch<React.SetStateAction<IWishWithReplies | undefined>>;
}

export const WishContext = createContext<WishContextType>({
    wishes: undefined,
    currentWish: undefined,
    setWishes: () => {},
    setCurrentWish: () => {},
});

export const WishProvider = ({ children }: { children: ReactNode }) => {
    const [wishes, setWishes] = useState<IWish[]>();
    const [currentWish, setCurrentWish] = useState<IWishWithReplies>();

    return (
        <WishContext.Provider
            value={{
                wishes,
                currentWish,
                setWishes,
                setCurrentWish,
            }}
        >
            {children}
        </WishContext.Provider>
    );
};
