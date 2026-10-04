import { createContext } from 'react';
import { IUserRelation } from '../types/user_relation';
import { IUser } from '../types/user';

interface CurrentUserRelationContextType {
    me: IUser;
    currentUserRelation: IUserRelation;
}

export const CurrentUserRelationContext = createContext({
    me: undefined,
    currentUserRelation: undefined,
} as unknown as CurrentUserRelationContextType);
