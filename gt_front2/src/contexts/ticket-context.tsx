import { createContext, ReactNode, useState } from 'react';
import { ITicketsForMonth } from '../types/ticket';
interface TicketContextType {
    receivingTicketsByMonth: ITicketsForMonth | undefined;
    givingTicketsByMonth: ITicketsForMonth | undefined;
    setReceivingTicketsByMonth: React.Dispatch<React.SetStateAction<ITicketsForMonth | undefined>>;
    setGivingTicketsByMonth: React.Dispatch<React.SetStateAction<ITicketsForMonth | undefined>>;
}

export const TicketContext = createContext<TicketContextType>({
    receivingTicketsByMonth: undefined,
    givingTicketsByMonth: undefined,
    setReceivingTicketsByMonth: () => {},
    setGivingTicketsByMonth: () => {},
});

export const TicketProvider = ({ children }: { children: ReactNode }) => {
    const [receivingTicketsByMonth, setReceivingTicketsByMonth] = useState<ITicketsForMonth>();
    const [givingTicketsByMonth, setGivingTicketsByMonth] = useState<ITicketsForMonth>();

    return (
        <TicketContext.Provider
            value={{
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
