import { IWish, IWishWithReplies } from '../types/ticket';
import client from './axios';
import { AxiosResponse } from 'axios';

interface WishReplyResponse {
    web_push_result: 'Sent' | 'NotSent';
}

export const WishAPI = {
    BASE_URL: '/api/user_relations/{userRelationId}/wish/',

    list: async (userRelationId: number): Promise<AxiosResponse<IWish[]>> => {
        return await client.get(WishAPI.BASE_URL.replace('{userRelationId}', String(userRelationId)));
    },
    get: async (userRelationId: number, wishId: string): Promise<AxiosResponse<IWishWithReplies>> => {
        return await client.get(`${WishAPI.BASE_URL.replace('{userRelationId}', String(userRelationId))}${wishId}/`);
    },
    updateReactions: async (userRelationId: number, wishId: string, reactions: string): Promise<AxiosResponse<null>> => {
        return await client.put(`${WishAPI.BASE_URL.replace('{userRelationId}', String(userRelationId))}${wishId}/reactions/`, { reactions });
    },
    reply: async (userRelationId: number, wishId: string, description: string): Promise<AxiosResponse<WishReplyResponse>> => {
        return await client.post(`${WishAPI.BASE_URL.replace('{userRelationId}', String(userRelationId))}${wishId}/reply/`, { description });
    },
};
