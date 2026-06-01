export interface IUserRelation {
    id: number;
    related_username: string;
    giving_ticket_img: string | null;
    receiving_ticket_img: string | null;
    use_slack: boolean;
    first_giving_ticket_date:  string | null;
    first_receiving_ticket_date: string | null;
    first_diary_date: string | null;
}

export type RelationKind = 'Receiving' | 'Giving';