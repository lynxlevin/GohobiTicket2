import { AxiosResponse } from 'axios';
import client from './axios';
import { ITicket } from '../types/ticket';
import { format } from 'date-fns';

export interface ListTicketsRequest {
    userRelationId: number;
    isGiving: boolean;
    giftDateGte?: Date;
    giftDateLte?: Date;
}

interface ListTicketsResponse {
    tickets: ITicket[];
}

interface UpsertTicketResponse {
    ticket: ITicket;
}

interface UseTicketResponse {
    ticket: ITicket;
    web_push_result: 'Sent' | 'NotSent';
}

export interface CreateTicketRequest {
    gift_date: string;
    description: string;
    user_relation_id: number;
    is_special: boolean;
    status?: string;
}

export const TicketAPI = {
    BASE_URL: '/api/tickets/',

    list: async ({ userRelationId, isGiving, giftDateGte, giftDateLte }: ListTicketsRequest): Promise<AxiosResponse<ListTicketsResponse>> => {
        let url = TicketAPI.BASE_URL;
        const queries = [`user_relation_id=${userRelationId}`];
        isGiving ? queries.push('is_giving') : queries.push('is_receiving');
        if (giftDateGte) queries.push(`gift_date_gte=${format(giftDateGte, 'yyyy-MM-dd')}`);
        if (giftDateLte) queries.push(`gift_date_lte=${format(giftDateLte, 'yyyy-MM-dd')}`);
        url += `?${queries.join('&')}`;
        return await client.get(url);
    },
    create: async (props: CreateTicketRequest): Promise<AxiosResponse<UpsertTicketResponse>> => {
        return await client.post(TicketAPI.BASE_URL, { ticket: props });
    },
    update: async (ticketId: number, props: { description: string; is_special: boolean; status?: string }): Promise<AxiosResponse<UpsertTicketResponse>> => {
        const url = `${TicketAPI.BASE_URL}${ticketId}/`;
        return await client.put(url, { ticket: props });
    },
    delete: async (ticketId: number) => {
        const url = `${TicketAPI.BASE_URL}${ticketId}/`;
        return await client.delete(url);
    },
    use: async (ticketId: number, props: { use_description: string }): Promise<AxiosResponse<UseTicketResponse>> => {
        const url = `${TicketAPI.BASE_URL}${ticketId}/use/`;
        return await client.put(url, { ticket: props });
    },
    read: async (ticketId: number) => {
        const url = `${TicketAPI.BASE_URL}${ticketId}/read/`;
        return await client.put(url, {});
    },
};
