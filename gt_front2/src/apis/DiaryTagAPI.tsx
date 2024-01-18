import { AxiosResponse } from 'axios';
import { IDiaryTag } from '../contexts/diary-tag-context';
import client from './axios';

interface ListDiaryTagResponse {
    diary_tags: IDiaryTag[];
}

export const DiaryTagAPI = {
    BASE_URL: '/api/diary_tags/',

    list: async (userRelationId: number): Promise<AxiosResponse<ListDiaryTagResponse>> => {
        const url = `${DiaryTagAPI.BASE_URL}?user_relation_id=${userRelationId}`;
        return await client.get(url);
    },
    // create: async (props: CreateDiaryRequest): Promise<AxiosResponse<IDiary>> => {
    //     return await client.post(DiaryAPI.BASE_URL, props, { headers: { 'content-type': 'application/json' } });
    // },
};
