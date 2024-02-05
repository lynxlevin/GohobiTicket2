import { createContext } from 'react';

export interface UserContextType {
    isLoggedIn: boolean | null;
    defaultRelationId: string | null;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | null>>;
    setDefaultRelationId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const UserContext = createContext({
    isLoggedIn: null,
    setIsLoggedIn: () => {},
    defaultRelationId: null,
    setDefaultRelationId: () => {},
} as unknown as UserContextType);
