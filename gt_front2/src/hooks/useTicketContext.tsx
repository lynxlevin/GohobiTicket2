import { useCallback, useContext } from 'react';
import { CreateTicketRequest, TicketAPI } from '../apis/TicketAPI';
import { ITicket, TicketContext } from '../contexts/ticket-context';
import { RelationKind } from '../contexts/user-relation-context';

const useTicketContext = () => {
    const ticketContext = useContext(TicketContext);

    const receivingTickets = ticketContext.receivingTickets;
    const givingTickets = ticketContext.givingTickets;

    const getReceivingTickets = useCallback(
        async (userRelationId: number | string) => {
            TicketAPI.list(Number(userRelationId), false).then(({ data: { tickets } }) => {
                ticketContext.setReceivingTickets(tickets);
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ticketContext.setReceivingTickets],
    );

    const getGivingTickets = useCallback(
        async (userRelationId: number | string) => {
            TicketAPI.list(Number(userRelationId), true).then(({ data: { tickets } }) => {
                ticketContext.setGivingTickets(tickets);
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ticketContext.setGivingTickets],
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
        ({ showOnlySpecial, showOnlyUsed, relationKind }: { showOnlySpecial: boolean; showOnlyUsed: boolean; relationKind: RelationKind }) => {
            const tickets = relationKind === 'Receiving' ? ticketContext.receivingTickets : ticketContext.givingTickets;
            if (tickets === undefined) return [];
            return tickets
                .filter(ticket => !showOnlySpecial || ticket.is_special)
                .filter(ticket => !showOnlyUsed || ticket.use_date !== null)
                .sort(sortConditions);
        },
        [ticketContext.givingTickets, ticketContext.receivingTickets],
    );

    const getLastAvailableTicketId = useCallback((relationKind: RelationKind) => {
        const tickets = relationKind === 'Receiving' ? ticketContext.receivingTickets : ticketContext.givingTickets;
        if (tickets === undefined) return undefined;
        const availableTickets = tickets.filter(ticket => ticket.use_date === null).sort(sortConditions);
        if (availableTickets.length === 0) return undefined;
        return availableTickets.slice(-1)[0].id;
    }, [ticketContext.givingTickets, ticketContext.receivingTickets]);

    const createTicket = useCallback(async (data: CreateTicketRequest) => {
        TicketAPI.create(data).then(({ data: { ticket } }) => {
            ticketContext.setGivingTickets(prev => {
                if (prev === undefined) return [ticket];
                return [ticket, ...prev].sort(sortConditions);
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateTicket = useCallback(async (ticketId: number, description: string, isSpecial: boolean, willFinalize?: boolean) => {
        const payload: { description: string; is_special: boolean; status?: string } = {
            description,
            is_special: isSpecial,
        };
        if (willFinalize) payload.status = 'unread';
        TicketAPI.update(ticketId, payload).then(({ data: { ticket } }) => {
            ticketContext.setGivingTickets(prev => {
                const tickets = [...prev!];
                tickets[tickets.findIndex(p => p.id === ticket.id)] = ticket;
                return tickets;
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const deleteTicket = useCallback(async (ticketId: number) => {
        TicketAPI.delete(ticketId).then(_ => {
            ticketContext.setGivingTickets(prev => prev!.filter(ticket => ticket.id !== ticketId));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const consumeTicket = useCallback(async (ticketId: number, useDescription: string) => {
        const payload = {
            use_description: useDescription,
        };
        TicketAPI.use(ticketId, payload).then(({ data: { ticket } }) => {
            ticketContext.setReceivingTickets(prev => {
                const tickets = [...prev!];
                tickets[tickets.findIndex(p => p.id === ticket.id)] = ticket;
                return tickets;
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const readTicket = useCallback(async (ticketId: number) => {
        TicketAPI.read(ticketId).then(() => {
            ticketContext.setReceivingTickets(prev => {
                // Intentionally not triggering re-render.
                prev![prev!.findIndex(p => p.id === ticketId)].status = 'read';
                return prev;
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clearTicketCache = useCallback(() => {
        ticketContext.setReceivingTickets(undefined);
        ticketContext.setGivingTickets(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        receivingTickets,
        givingTickets,
        getReceivingTickets,
        getGivingTickets,
        getSortedTickets,
        getLastAvailableTicketId,
        createTicket,
        updateTicket,
        deleteTicket,
        consumeTicket,
        readTicket,
        clearTicketCache,
    };
};

export default useTicketContext;
