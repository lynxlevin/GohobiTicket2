import { useCallback, useContext } from 'react';
import { CreateTicketRequest, TicketAPI } from '../apis/TicketAPI';
import { TicketContext } from '../contexts/ticket-context';
import { endOfMonth, format, parse, startOfMonth } from 'date-fns';
import { ITicket, IWish } from '../types/ticket';
import { WishContext } from '../contexts/wish-context';
import useGlobalErrorContext from './useGlobalErrorContext';

const useTicketContext = () => {
    const ticketContext = useContext(TicketContext);
    const wishContext = useContext(WishContext);
    const { handleAPIError, handleAPIErrorThrowing } = useGlobalErrorContext();

    const receivingTicketsByMonth = ticketContext.receivingTicketsByMonth;
    const givingTicketsByMonth = ticketContext.givingTicketsByMonth;

    const getReceivingTicketsByMonth = useCallback(
        async (userRelationId: number, yearMonth: string) => {
            const firstOfMonth = startOfMonth(parse(yearMonth, 'yyyyMM', new Date()));
            TicketAPI.list({ userRelationId, isGiving: false, giftDateGte: firstOfMonth, giftDateLte: endOfMonth(firstOfMonth) })
                .then(({ data: { tickets } }) => {
                    ticketContext.setReceivingTicketsByMonth(prev => {
                        const toBe = { ...prev };
                        toBe[yearMonth] = tickets;
                        return toBe;
                    });
                })
                .catch(handleAPIError);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ticketContext.setReceivingTicketsByMonth],
    );
    const getGivingTicketsByMonth = useCallback(
        async (userRelationId: number, yearMonth: string) => {
            const firstOfMonth = startOfMonth(parse(yearMonth, 'yyyyMM', new Date()));
            TicketAPI.list({ userRelationId, isGiving: true, giftDateGte: firstOfMonth, giftDateLte: endOfMonth(firstOfMonth) })
                .then(({ data: { tickets } }) => {
                    ticketContext.setGivingTicketsByMonth(prev => {
                        const toBe = { ...prev };
                        toBe[yearMonth] = tickets;
                        return toBe;
                    });
                })
                .catch(handleAPIError);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ticketContext.setGivingTicketsByMonth],
    );

    const createTicket = async (data: CreateTicketRequest) => {
        TicketAPI.create(data)
            .then(({ data: { ticket } }) => {
                const yearMonth = format(new Date(ticket.gift_date), 'yyyyMM');
                ticketContext.setGivingTicketsByMonth(prev => {
                    const toBe = { ...prev };
                    if (toBe[yearMonth] === undefined) {
                        toBe[yearMonth] = [ticket];
                    } else {
                        toBe[yearMonth].push(ticket);
                        toBe[yearMonth] = toBe[yearMonth].sort((a, b) => (a.gift_date > b.gift_date ? -1 : 1));
                    }
                    return toBe;
                });
            })
            .catch(handleAPIErrorThrowing);
    };

    const updateTicket = async (ticket: ITicket, description: string, isSpecial: boolean, willFinalize?: boolean) => {
        const payload: { description: string; is_special: boolean; publish: boolean } = {
            description,
            is_special: isSpecial,
            publish: willFinalize ?? false,
        };
        await TicketAPI.update(ticket.id, payload)
            .then(({ data: { ticket } }) => {
                ticketContext.setGivingTicketsByMonth(prev => {
                    const yearMonth = format(new Date(ticket.gift_date), 'yyyyMM');
                    const toBe = { ...prev };
                    toBe[yearMonth][toBe[yearMonth].findIndex(p => p.id === ticket.id)] = ticket;
                    return toBe;
                });
            })
            .catch(handleAPIErrorThrowing);
    };

    const deleteTicket = async (ticket: ITicket) => {
        const originalYearMonth = format(new Date(ticket.gift_date), 'yyyyMM');
        await TicketAPI.delete(ticket.id)
            .then(_ => {
                ticketContext.setGivingTicketsByMonth(prev => {
                    const toBe = { ...prev };
                    toBe[originalYearMonth] = toBe[originalYearMonth].filter(t => t.id !== ticket.id);
                    return toBe;
                });
            })
            .catch(handleAPIErrorThrowing);
    };

    const consumeTicket = async (ticketId: number, useDescription: string) => {
        const payload = {
            use_description: useDescription,
        };
        const webPushResult = await TicketAPI.use(ticketId, payload)
            .then(({ data: { ticket, web_push_result } }) => {
                ticketContext.setReceivingTicketsByMonth(prev => {
                    const yearMonth = format(new Date(ticket.gift_date), 'yyyyMM');
                    if (prev === undefined || prev[yearMonth] === undefined) return prev;
                    const toBe = { ...prev };
                    toBe[yearMonth][toBe[yearMonth].findIndex(p => p.id === ticket.id)] = ticket;
                    return toBe;
                });
                if (wishContext.wishes !== undefined) {
                    wishContext.setWishes(prev => {
                        return [{ ...ticket.wish, reactions: '', has_replies: false, ticket: { ...ticket } } as IWish, ...prev!];
                    });
                }
                return web_push_result;
            })
            .catch(handleAPIErrorThrowing);
        return webPushResult;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    };

    const readTicket = async (ticket: ITicket) => {
        await TicketAPI.read(ticket.id)
            .then(() => {
                ticketContext.setReceivingTicketsByMonth(prev => {
                    const yearMonth = format(new Date(ticket.gift_date), 'yyyyMM');
                    // Intentionally not triggering re-render.
                    prev![yearMonth][prev![yearMonth].findIndex(p => p.id === ticket.id)].status = 'Read';
                    return prev;
                });
            })
            .catch(handleAPIErrorThrowing);
    };

    const clearTicketCache = useCallback(() => {
        ticketContext.setReceivingTicketsByMonth(undefined);
        ticketContext.setGivingTicketsByMonth(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        receivingTicketsByMonth,
        givingTicketsByMonth,
        getReceivingTicketsByMonth,
        getGivingTicketsByMonth,
        createTicket,
        updateTicket,
        deleteTicket,
        consumeTicket,
        readTicket,
        clearTicketCache,
    };
};

export default useTicketContext;
