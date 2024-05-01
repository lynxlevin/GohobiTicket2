import { createContext } from 'react';

export type TicketStatus = "unread" | "edited" | "read" | 'draft';

export interface ITicket {
    id: number;
    user_relation_id: number;
    description: string;
    gift_date: string;
    use_description: string;
    use_date: string;
    status: TicketStatus;
    is_special: boolean;
}

export interface TicketContextType {
    tickets: ITicket[];
    setTickets: React.Dispatch<React.SetStateAction<ITicket[]>>;
}

export const TicketContext = createContext({
    tickets: [],
    setTickets: () => {},
} as unknown as TicketContextType);
