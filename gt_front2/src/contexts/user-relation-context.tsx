import { createContext, ReactNode, useState } from 'react';

export interface IUserRelation {
    id: string;
    related_username: string;
    giving_ticket_img: string | null;
    receiving_ticket_img: string | null;
    use_slack: boolean;
}

export type RelationKind = 'Receiving' | 'Giving';

export interface UserRelationContextType {
    userRelations: IUserRelation[] | undefined;
    setUserRelations: React.Dispatch<React.SetStateAction<IUserRelation[] | undefined>>;
}

export const UserRelationContext = createContext({
    userRelations: undefined,
    setUserRelations: () => {},
} as unknown as UserRelationContextType);

export const UserRelationProvider = ({ children }: { children: ReactNode }) => {
    const [userRelations, setUserRelations] = useState<IUserRelation[]>();

    return (
        <UserRelationContext.Provider value={{ userRelations, setUserRelations }}>
            {children}
        </UserRelationContext.Provider>
    );
};
