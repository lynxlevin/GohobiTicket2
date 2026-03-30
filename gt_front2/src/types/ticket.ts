export type TicketStatus = 'unread' | 'edited' | 'read' | 'draft';

export interface ITicket {
    id: number;
    user_relation_id: number;
    giving_user_id: number;
    description: string;
    gift_date: string;
    use_description: string;
    use_date: string | null;
    status: TicketStatus;
    is_special: boolean;
}
