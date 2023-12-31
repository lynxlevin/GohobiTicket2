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
};
