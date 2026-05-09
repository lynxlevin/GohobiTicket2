import { useCallback, useContext } from 'react';
import { CreateTicketRequest, TicketAPI } from '../apis/TicketAPI';
import { TicketContext } from '../contexts/ticket-context';
import { RelationKind } from '../types/user_relation';
import { endOfMonth, parse, startOfMonth } from 'date-fns';

const useTicketContext = () => {
    const ticketContext = useContext(TicketContext);

    const receivingTickets = ticketContext.receivingTickets;
    const givingTickets = ticketContext.givingTickets;
    const receivingTicketsByMonth = ticketContext.receivingTicketsByMonth;
    const givingTicketsByMonth = ticketContext.givingTicketsByMonth;

    const getReceivingTicketsByMonth = useCallback(
        async (userRelationId: number, yearMonth: string) => {
            const firstOfMonth = startOfMonth(parse(yearMonth, 'yyyyMM', new Date()));
            TicketAPI.list({ userRelationId, isGiving: false, giftDateGte: firstOfMonth, giftDateLte: endOfMonth(firstOfMonth) }).then(
                ({ data: { tickets } }) => {
                    ticketContext.setReceivingTicketsByMonth(prev => {
                        const toBe = { ...prev };
                        toBe[yearMonth] = tickets;
                        return toBe;
                    });
                },
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ticketContext.setReceivingTicketsByMonth],
    );
    const getGivingTicketsByMonth = useCallback(
        async (userRelationId: number, yearMonth: string) => {
            const firstOfMonth = startOfMonth(parse(yearMonth, 'yyyyMM', new Date()));
            TicketAPI.list({ userRelationId, isGiving: true, giftDateGte: firstOfMonth, giftDateLte: endOfMonth(firstOfMonth) }).then(
                ({ data: { tickets } }) => {
                    ticketContext.setGivingTicketsByMonth(prev => {
                        const toBe = { ...prev };
                        toBe[yearMonth] = tickets;
                        return toBe;
                    });
                },
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ticketContext.setGivingTicketsByMonth],
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
        receivingTicketsByMonth,
        givingTicketsByMonth,
        getReceivingTicketsByMonth,
        getGivingTicketsByMonth,
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
