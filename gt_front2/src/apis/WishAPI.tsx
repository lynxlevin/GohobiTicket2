import { IWish } from '../types/ticket';
import client from './axios';
import { AxiosResponse } from 'axios';

export const WishAPI = {
    BASE_URL: '/api/user_relations/{user_relation_id}/wish/',

    list: async (user_relation_id: number): Promise<AxiosResponse<IWish[]>> => {
        return await client.get(WishAPI.BASE_URL.replace('{user_relation_id}', String(user_relation_id)));
    },
};
