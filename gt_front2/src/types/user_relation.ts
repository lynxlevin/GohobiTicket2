export interface IUserRelation {
    id: number;
    related_username: string;
    giving_ticket_img: string | null;
    receiving_ticket_img: string | null;
    use_slack: boolean;
}

export type RelationKind = 'Receiving' | 'Giving';