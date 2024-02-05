import { IUserRelation } from '../contexts/user-relation-context';
import client from './axios';
import { AxiosResponse } from 'axios';

interface ListUserRelationResponse {
    user_relations: IUserRelation[];
}

export const UserRelationAPI = {
    BASE_URL: '/api/user_relations/',

    list: async (): Promise<AxiosResponse<ListUserRelationResponse>> => {
        return await client.get(UserRelationAPI.BASE_URL);
    },
    checkSpecialTicketAvailability: async (data: {userRelationId: number, year: number, month: number}): Promise<AxiosResponse<boolean>> => {
        const url = `${UserRelationAPI.BASE_URL}${data.userRelationId}/special_ticket_availability/?year=${data.year}&month=${data.month}`;
        return await client.get(url);
    },
};
