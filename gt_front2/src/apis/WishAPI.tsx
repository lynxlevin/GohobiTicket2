import { IWish } from '../types/ticket';
import client from './axios';
import { AxiosResponse } from 'axios';



interface WishReplyResponse {
    web_push_result: 'Sent' | 'NotSent';
}

export const WishAPI = {
    BASE_URL: '/api/user_relations/{user_relation_id}/wish/',

    list: async (user_relation_id: number): Promise<AxiosResponse<IWish[]>> => {
        return await client.get(WishAPI.BASE_URL.replace('{user_relation_id}', String(user_relation_id)));
    },
    reply: async (user_relation_id: number, wish_id: string, description: string): Promise<AxiosResponse<WishReplyResponse>> => {
        return await client.post(`${WishAPI.BASE_URL.replace('{user_relation_id}', String(user_relation_id))}${wish_id}/reply/`, {description});
    }
};
