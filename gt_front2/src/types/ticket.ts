export type TicketStatus = 'unread' | 'edited' | 'read' | 'draft';
export type WishStatus = 'unread' | 'read';

export interface ITicket {
    id: number;
    user_relation_id: number;
    giving_user_id: number;
    description: string;
    gift_date: string;
    status: TicketStatus;
    is_special: boolean;
    wish: WishInner | null;
}

interface WishInner {
    id: string;
    description: string;
    status: WishStatus;
    created_at: string;
}

export interface IWish {
    id: string;
    description: string;
    status: WishStatus;
    created_at: string;
    ticket: {
        id: number;
        giving_user_id: number;
        description: string;
        gift_date: string;
        is_special: boolean;
    }
}

