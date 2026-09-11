import client from './axios';
import { AxiosResponse } from 'axios';

export const WishReplyAPI = {
    BASE_URL: '/api/user_relations/{userRelationId}/wish_replies/',

    updateReactions: async (userRelationId: number, wishReplyId: string, reactions: string): Promise<AxiosResponse<null>> => {
        return await client.put(`${WishReplyAPI.BASE_URL.replace('{userRelationId}', String(userRelationId))}${wishReplyId}/reactions/`, { reactions });
    },
};
