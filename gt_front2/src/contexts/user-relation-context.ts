import { createContext } from 'react';

export interface IUserRelation {
    id: number;
    related_username: string;
    is_giving_relation: boolean;
    ticket_image: string;
    corresponding_relation_id: number;
}

export interface UserRelationContextType {
    userRelations: IUserRelation[];
    setUserRelations: React.Dispatch<React.SetStateAction<IUserRelation[]>>;
}

export const UserRelationContext = createContext({
    userRelations: [],
    setUserRelations: () => {},
} as unknown as UserRelationContextType);
