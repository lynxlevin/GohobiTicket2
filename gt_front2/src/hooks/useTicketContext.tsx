import { useCallback, useContext } from 'react';
import { CreateTicketRequest, TicketAPI } from '../apis/TicketAPI';
import { TicketContext } from '../contexts/ticket-context';
import { RelationKind } from '../types/user_relation';

const useTicketContext = () => {
    const ticketContext = useContext(TicketContext);

    const receivingTickets = ticketContext.receivingTickets;
    const givingTickets = ticketContext.givingTickets;

    const getReceivingTickets = useCallback(
        async (userRelationId: number | string) => {
            TicketAPI.list({ userRelationId: Number(userRelationId), isGiving: false }).then(({ data: { tickets } }) => {
                ticketContext.setReceivingTickets(tickets);
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ticketContext.setReceivingTickets],
    );

    const getGivingTickets = useCallback(
        async (userRelationId: number | string) => {
            TicketAPI.list({ userRelationId: Number(userRelationId), isGiving: true }).then(({ data: { tickets } }) => {
                ticketContext.setGivingTickets(tickets);
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ticketContext.setGivingTickets],
    );

    // MYMEMO: fix
    const getLastAvailableNormalTicket = useCallback(
        (relationKind: RelationKind) => {
            return ticketContext.givingTickets === undefined ? undefined : ticketContext.givingTickets[0];
            // const tickets = relationKind === 'Receiving' ? ticketContext.receivingTickets : ticketContext.givingTickets;
            // if (tickets === undefined) return undefined;
            // const availableTickets = tickets.filter(ticket => ticket.wish === null && !ticket.is_special).sort(sortConditions);
            // if (availableTickets.length === 0) return undefined;
            // return availableTickets.slice(-1)[0];
        },
        [ticketContext.givingTickets, ticketContext.receivingTickets],
    );
    // MYMEMO: fix
    const getLastAvailableSpecialTicket = useCallback(
        (relationKind: RelationKind) => {
            return ticketContext.givingTickets === undefined ? undefined : ticketContext.givingTickets[0];
            // const tickets = relationKind === 'Receiving' ? ticketContext.receivingTickets : ticketContext.givingTickets;
            // if (tickets === undefined) return undefined;
            // const availableTickets = tickets.filter(ticket => ticket.wish === null && ticket.is_special).sort(sortConditions);
            // if (availableTickets.length === 0) return undefined;
            // return availableTickets.slice(-1)[0];
        },
        [ticketContext.givingTickets, ticketContext.receivingTickets],
    );

    const createTicket = useCallback(async (data: CreateTicketRequest) => {
        TicketAPI.create(data).then(({ data: { ticket } }) => {
            ticketContext.setGivingTickets(prev => {
                if (prev === undefined) return [ticket];
                return [ticket, ...prev].sort((a, b) => {
                    return a.gift_date > b.gift_date ? -1 : 1;
                });
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
        const {
            data: { ticket, web_push_result },
        } = await TicketAPI.use(ticketId, payload);
        ticketContext.setReceivingTickets(prev => {
            const tickets = [...prev!];
            tickets[tickets.findIndex(p => p.id === ticket.id)] = ticket;
            return tickets;
        });
        return web_push_result;
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
        getLastAvailableNormalTicket,
        getLastAvailableSpecialTicket,
        createTicket,
        updateTicket,
        deleteTicket,
        consumeTicket,
        readTicket,
        clearTicketCache,
    };
};

export default useTicketContext;
