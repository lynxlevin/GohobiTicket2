import { createContext, ReactNode, useState } from 'react';
import { IUserRelation } from '../types/user_relation';

interface UserRelationContextType {
    userRelations: IUserRelation[] | undefined;
    setUserRelations: React.Dispatch<React.SetStateAction<IUserRelation[] | undefined>>;
}

export const UserRelationContext = createContext({
    userRelations: undefined,
    setUserRelations: () => {},
} as unknown as UserRelationContextType);

export const UserRelationProvider = ({ children }: { children: ReactNode }) => {
    const [userRelations, setUserRelations] = useState<IUserRelation[]>();

    return <UserRelationContext.Provider value={{ userRelations, setUserRelations }}>{children}</UserRelationContext.Provider>;
};
