import { createContext, ReactNode, useState } from 'react';
import { ITicket } from '../types/ticket';
interface TicketContextType {
    receivingTickets: ITicket[] | undefined;
    givingTickets: ITicket[] | undefined;
    setReceivingTickets: React.Dispatch<React.SetStateAction<ITicket[] | undefined>>;
    setGivingTickets: React.Dispatch<React.SetStateAction<ITicket[] | undefined>>;
}

export const TicketContext = createContext<TicketContextType>({
    receivingTickets: undefined,
    givingTickets: undefined,
    setReceivingTickets: () => {},
    setGivingTickets: () => {},
});

export const TicketProvider = ({ children }: { children: ReactNode }) => {
    const [receivingTickets, setReceivingTickets] = useState<ITicket[]>();
    const [givingTickets, setGivingTickets] = useState<ITicket[]>();

    return <TicketContext.Provider value={{ receivingTickets, setReceivingTickets, givingTickets, setGivingTickets }}>{children}</TicketContext.Provider>;
};
