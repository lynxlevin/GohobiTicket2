import { createContext } from 'react';

export interface IUserRelation {
    id: string;
    related_username: string;
    giving_ticket_img: string | null;
    receiving_ticket_img: string | null;
    use_slack: boolean;
}

export interface UserRelationContextType {
    userRelations: IUserRelation[];
    setUserRelations: React.Dispatch<React.SetStateAction<IUserRelation[]>>;
}

export type RelationKind = 'Receiving' | 'Giving';

export const UserRelationContext = createContext({
    userRelations: [],
    setUserRelations: () => {},
} as unknown as UserRelationContextType);
