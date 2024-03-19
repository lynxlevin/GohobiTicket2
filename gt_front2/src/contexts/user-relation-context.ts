import { createContext } from 'react';

export interface IUserRelation {
    id: string;
    related_username: string;
    giving_ticket_img: string;
    receiving_ticket_img: string;
}

export interface UserRelationContextType {
    userRelations: IUserRelation[];
    setUserRelations: React.Dispatch<React.SetStateAction<IUserRelation[]>>;
}

export const UserRelationContext = createContext({
    userRelations: [],
    setUserRelations: () => {},
} as unknown as UserRelationContextType);
