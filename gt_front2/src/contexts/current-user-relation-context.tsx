import { createContext } from 'react';
import { IUserRelation } from '../types/user_relation';

interface CurrentUserRelationContextType {
    currentUserRelation: IUserRelation;
}

export const CurrentUserRelationContext = createContext({
    currentUserRelation: undefined,
} as unknown as CurrentUserRelationContextType);
