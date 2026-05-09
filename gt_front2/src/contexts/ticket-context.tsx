import { createContext, ReactNode, useState } from 'react';
import { ITicket, ITicketsForMonth } from '../types/ticket';
interface TicketContextType {
    receivingTickets: ITicket[] | undefined;
    givingTickets: ITicket[] | undefined;
    setReceivingTickets: React.Dispatch<React.SetStateAction<ITicket[] | undefined>>;
    setGivingTickets: React.Dispatch<React.SetStateAction<ITicket[] | undefined>>;
    receivingTicketsByMonth: ITicketsForMonth | undefined;
    givingTicketsByMonth: ITicketsForMonth | undefined;
    setReceivingTicketsByMonth: React.Dispatch<React.SetStateAction<ITicketsForMonth | undefined>>;
    setGivingTicketsByMonth: React.Dispatch<React.SetStateAction<ITicketsForMonth | undefined>>;
}

export const TicketContext = createContext<TicketContextType>({
    receivingTickets: undefined,
    givingTickets: undefined,
    setReceivingTickets: () => {},
    setGivingTickets: () => {},
    receivingTicketsByMonth: undefined,
    givingTicketsByMonth: undefined,
    setReceivingTicketsByMonth: () => {},
    setGivingTicketsByMonth: () => {},
});

export const TicketProvider = ({ children }: { children: ReactNode }) => {
    const [receivingTickets, setReceivingTickets] = useState<ITicket[]>();
    const [givingTickets, setGivingTickets] = useState<ITicket[]>();
    const [receivingTicketsByMonth, setReceivingTicketsByMonth] = useState<ITicketsForMonth>();
    const [givingTicketsByMonth, setGivingTicketsByMonth] = useState<ITicketsForMonth>();

    return (
        <TicketContext.Provider
            value={{
                receivingTickets,
                setReceivingTickets,
                givingTickets,
                setGivingTickets,
                receivingTicketsByMonth,
                givingTicketsByMonth,
                setReceivingTicketsByMonth,
                setGivingTicketsByMonth,
            }}
        >
            {children}
        </TicketContext.Provider>
    );
};
