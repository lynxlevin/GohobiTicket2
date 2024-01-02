import client from './axios';
import { AxiosResponse } from 'axios';

export interface ITicket {
    id: number;
    user_relation_id: number;
    description: string;
    gift_date: string;
    use_description: string;
    use_date: string;
    status: string;
    is_special: boolean;
}

interface ListTicketResponse {
    available_tickets: ITicket[];
    used_tickets: ITicket[];
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

    list: async (userRelationId: number): Promise<AxiosResponse<ListTicketResponse>> => {
        const url = `${TicketAPI.BASE_URL}?user_relation_id=${userRelationId}`;
        return await client.get(url);
    },
    create: async (props: CreateTicketRequest) => {
        return await client.post(TicketAPI.BASE_URL, {ticket: props}, { headers: { 'content-type': 'application/json' } })
    },
    update: async (ticket_id: number, props: {description: string}): Promise<AxiosResponse<ITicket>> => {
        const url = `${TicketAPI.BASE_URL}${ticket_id}/`;
        return await client.patch(url, {ticket: props}, { headers: { 'content-type': 'application/json' } })
    }
};
