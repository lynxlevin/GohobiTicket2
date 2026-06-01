import { IDiary } from '../types/diary';
import { ITicket } from '../types/ticket';
import { IUserRelation } from '../types/user_relation';
import client from './axios';
import { AxiosResponse } from 'axios';

interface ListUserRelationResponse {
    user_relations: IUserRelation[];
}

interface SearchResponse {
    giving_tickets: ITicket[];
    receiving_tickets: ITicket[];
    diaries: IDiary[];
}

interface AvailableTicketsResponse {
    oldest: {
        normal: ITicket | null;
        special: ITicket | null;
    };
}

export const UserRelationAPI = {
    BASE_URL: '/api/user_relations/',

    list: async (): Promise<AxiosResponse<ListUserRelationResponse>> => {
        return await client.get(UserRelationAPI.BASE_URL);
    },
    checkSpecialTicketAvailability: async (data: { userRelationId: number; year: number; month: number }): Promise<AxiosResponse<boolean>> => {
        const url = `${UserRelationAPI.BASE_URL}${data.userRelationId}/special_ticket_availability/?year=${data.year}&month=${data.month}`;
        return await client.get(url);
    },
    search: async (data: { userRelationId: number; text: string }): Promise<AxiosResponse<SearchResponse>> => {
        const url = `${UserRelationAPI.BASE_URL}${data.userRelationId}/search/`;
        return await client.post(url, { text: data.text });
    },
    availableTickets: async (data: { userRelationId: number }): Promise<AxiosResponse<AvailableTicketsResponse>> => {
        const url = `${UserRelationAPI.BASE_URL}${data.userRelationId}/available_tickets/`;
        return await client.get(url);
    },
};
