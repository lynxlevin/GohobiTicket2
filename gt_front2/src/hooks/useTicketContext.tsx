import { useCallback, useContext, useMemo } from 'react';
import { CreateTicketRequest, TicketAPI } from '../apis/TicketAPI';
import { ITicket, TicketContext } from '../contexts/ticket-context';

const useTicketContext = () => {
    const ticketContext = useContext(TicketContext);

    const getTickets = useCallback(
        async (userRelationId: number | string) => {
            const {
                data: { tickets },
            } = await TicketAPI.list(Number(userRelationId));
            ticketContext.setTickets(tickets);
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
        [ticketContext.tickets],
    );

    const createTicket = useCallback(async (data: CreateTicketRequest) => {
        const {
            data: { ticket },
        } = await TicketAPI.create(data);
        ticketContext.setTickets(prev => {
            return [ticket, ...prev].sort(sortConditions);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateTicket = useCallback(async (ticketId: number, description: string) => {
        const payload = {
            description,
        };
        const res = await TicketAPI.update(ticketId, payload);
        // updateTicketList(res.data.ticket);
    }, []);

    return {
        getTickets,
        getSortedTickets,
        createTicket,
        updateTicket,
    };
};

export default useTicketContext;
