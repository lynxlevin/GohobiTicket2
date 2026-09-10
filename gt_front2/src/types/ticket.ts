export type TicketStatus = 'Unread' | 'Edited' | 'Read' | 'Draft';
export type WishStatus = 'Unread' | 'Read';

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

export interface ITicketsForMonth {
    [yearMonth: string]: ITicket[];
}

export interface IWish {
    id: string;
    description: string;
    reactions: string;
    status: WishStatus;
    created_at: string;
    ticket: {
        id: number;
        giving_user_id: number;
        description: string;
        gift_date: string;
        is_special: boolean;
    }
    has_replies: boolean;
}

export interface IWishWithReplies extends IWish {
    replies: IWishReply[];
}

export interface IWishReply {
    id: string;
    description: string;
    reactions: string;
    posted_by_id: number;
    created_at: string;
}

