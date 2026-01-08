import { createContext, ReactNode, useState } from 'react';

export interface UserContextType {
    isLoggedIn: boolean | undefined;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

export const UserContext = createContext<UserContextType>({
    isLoggedIn: undefined,
    setIsLoggedIn: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>();

    return (
        <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
            {children}
        </UserContext.Provider>
    );
};
