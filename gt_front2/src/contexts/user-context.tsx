import { createContext, ReactNode, useState } from 'react';

export interface IUser {
    id: number;
    username: string;
    email: string;
}

export interface UserContextType {
    me: IUser | undefined;
    setMe: React.Dispatch<React.SetStateAction<IUser | undefined>>;
}

export const UserContext = createContext({
    me: undefined,
    setMe: () => {},
} as unknown as UserContextType);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [me, setMe] = useState<IUser>();

    return <UserContext.Provider value={{ me, setMe }}>{children}</UserContext.Provider>;
};
