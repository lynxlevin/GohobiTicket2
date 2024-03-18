import { createContext } from 'react';

export interface IUserRelation {
    id: string;
    related_username: string;
    user_1_giving_ticket_img: string;
    user_2_giving_ticket_img: string;
}

export interface UserRelationContextType {
    userRelations: IUserRelation[];
    setUserRelations: React.Dispatch<React.SetStateAction<IUserRelation[]>>;
}

export const UserRelationContext = createContext({
    userRelations: [],
    setUserRelations: () => {},
} as unknown as UserRelationContextType);
