import { AxiosResponse } from 'axios';
import { ITicket } from '../contexts/ticket-context';
import client from './axios';

interface ListTicketResponse {
    tickets: ITicket[];
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

    list: async (userRelationId: number, isGiving: boolean): Promise<AxiosResponse<ListTicketResponse>> => {
        const query = isGiving ? `user_relation_id=${userRelationId}&is_giving` : `user_relation_id=${userRelationId}&is_receiving`
        const url = `${TicketAPI.BASE_URL}?${query}`;
        return await client.get(url);
    },
    create: async (props: CreateTicketRequest) => {
        return await client.post(TicketAPI.BASE_URL, { ticket: props }, { headers: { 'content-type': 'application/json' } });
    },
    update: async (ticketId: number, props: { description: string }): Promise<AxiosResponse<ITicket>> => {
        const url = `${TicketAPI.BASE_URL}${ticketId}/`;
        return await client.put(url, { ticket: props }, { headers: { 'content-type': 'application/json' } });
    },
    delete: async (ticketId: number) => {
        const url = `${TicketAPI.BASE_URL}${ticketId}/`;
        return await client.delete(url);
    },
    use: async (ticketId: number, props: { use_description: string }): Promise<AxiosResponse<ITicket>> => {
        const url = `${TicketAPI.BASE_URL}${ticketId}/use/`;
        return await client.put(url, { ticket: props }, { headers: { 'content-type': 'application/json' } });
    },
    read: async (ticketId: number) => {
        const url = `${TicketAPI.BASE_URL}${ticketId}/read/`;
        return await client.put(url, {}, { headers: { 'content-type': 'application/json' } });
    },
};
