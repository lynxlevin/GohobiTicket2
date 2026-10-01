import { IWish, IWishWithReplies } from '../types/ticket';
import client from './axios';
import { AxiosResponse } from 'axios';

interface ListWishesResponse {
    wishes: IWish[];
    page_count: number | null;
}
interface WishReplyResponse {
    web_push_result: 'Sent' | 'NotSent';
}

export const WishAPI = {
    BASE_URL: '/api/user_relations/{userRelationId}/wish/',

    list: async (userRelationId: number, page: number, limit: number): Promise<AxiosResponse<ListWishesResponse>> => {
        const baseUrl = WishAPI.BASE_URL.replace('{userRelationId}', String(userRelationId));
        const url = `${baseUrl}?page=${page}&limit=${limit}`;
        return await client.get(url);
    },
    get: async (userRelationId: number, wishId: string): Promise<AxiosResponse<IWishWithReplies>> => {
        const baseUrl = WishAPI.BASE_URL.replace('{userRelationId}', String(userRelationId));
        const url = `${baseUrl}${wishId}/`;
        return await client.get(url);
    },
    updateReactions: async (userRelationId: number, wishId: string, reactions: string): Promise<AxiosResponse<null>> => {
        const baseUrl = WishAPI.BASE_URL.replace('{userRelationId}', String(userRelationId));
        const url = `${baseUrl}${wishId}/reactions/`;
        return await client.put(url, { reactions });
    },
    reply: async (userRelationId: number, wishId: string, description: string): Promise<AxiosResponse<WishReplyResponse>> => {
        const baseUrl = WishAPI.BASE_URL.replace('{userRelationId}', String(userRelationId));
        const url = `${baseUrl}${wishId}/reply/`;
        return await client.post(url, { description });
    },
};
