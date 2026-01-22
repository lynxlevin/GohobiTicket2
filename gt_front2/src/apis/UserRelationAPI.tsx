import { IDiary } from '../contexts/diary-context';
import { ITicket } from '../contexts/ticket-context';
import { IUserRelation } from '../contexts/user-relation-context';
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
};
