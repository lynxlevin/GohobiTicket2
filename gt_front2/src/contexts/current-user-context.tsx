import { createContext } from 'react';
import { IUserRelation } from '../types/user_relation';
import { IUser } from '../types/user';

interface CurrentUserContextType {
    me: IUser;
    userRelations: IUserRelation[];
}

export const CurrentUserContext = createContext({
    me: undefined,
    userRelations: undefined,
} as unknown as CurrentUserContextType);
