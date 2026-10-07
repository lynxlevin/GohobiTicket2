import { createContext } from 'react';
import { IUserRelation } from '../types/user_relation';
import { IUser } from '../types/user';

interface CurrentUserRelationContextType {
    me: IUser;
    currentUserRelation: IUserRelation;
    userRelations: IUserRelation[];
}

export const CurrentUserRelationContext = createContext({
    me: undefined,
    currentUserRelation: undefined,
    userRelations: undefined,
} as unknown as CurrentUserRelationContextType);
