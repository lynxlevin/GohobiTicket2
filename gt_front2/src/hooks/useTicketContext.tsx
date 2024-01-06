import { useCallback, useContext } from 'react';
import { CreateTicketRequest, TicketAPI } from '../apis/TicketAPI';
import { ITicket, TicketContext } from '../contexts/ticket-context';

const useTicketContext = () => {
    const ticketContext = useContext(TicketContext);

    const getTickets = useCallback(
        async (userRelationId: number | string) => {
            TicketAPI.list(Number(userRelationId)).then(({ data: { tickets } }) => {
                ticketContext.setTickets(tickets);
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ticketContext.setTickets],
    );

    const sortConditions = (a: ITicket, b: ITicket) => {
        const aIsNewer = a.gift_date > b.gift_date;
        const onlyAIsUsed = a.use_date !== null && b.use_date === null;
        const onlyBIsUsed = a.use_date === null && b.use_date !== null;

        if (onlyAIsUsed) return 1;
        if (onlyBIsUsed) return -1;
        return aIsNewer ? -1 : 1;
    };

    const getSortedTickets = useCallback(
        ({ showOnlySpecial, showOnlyUsed }: { showOnlySpecial: boolean; showOnlyUsed: boolean }) => {
            return ticketContext.tickets
                .filter(ticket => !showOnlySpecial || ticket.is_special)
                .filter(ticket => !showOnlyUsed || ticket.use_date !== null)
                .sort(sortConditions);
        },
        [ticketContext],
    );

    const createTicket = useCallback(async (data: CreateTicketRequest) => {
        TicketAPI.create(data).then(({ data: { ticket } }) => {
            ticketContext.setTickets(prev => {
                return [ticket, ...prev].sort(sortConditions);
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateTicket = useCallback(async (ticketId: number, description: string) => {
        const payload = {
            description,
        };
        TicketAPI.update(ticketId, payload).then(({ data: ticket }) => {
            ticketContext.setTickets(prev => {
                const tickets = [...prev];
                tickets[tickets.findIndex(p => p.id === ticket.id)] = ticket;
                return tickets;
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const deleteTicket = useCallback(async (ticketId: number) => {
        TicketAPI.delete(ticketId).then(_ => {
            ticketContext.setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const consumeTicket = useCallback(async (ticketId: number, useDescription: string) => {
        const payload = {
            use_description: useDescription,
        };
        TicketAPI.use(ticketId, payload).then(({ data: ticket }) => {
            ticketContext.setTickets(prev => {
                const tickets = [...prev];
                tickets[tickets.findIndex(p => p.id === ticket.id)] = ticket;
                return tickets;
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        getTickets,
        getSortedTickets,
        createTicket,
        updateTicket,
        deleteTicket,
        consumeTicket,
    };
};

export default useTicketContext;
