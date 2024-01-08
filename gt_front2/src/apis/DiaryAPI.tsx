import { AxiosResponse } from 'axios';
import { IDiaryTag } from './DiaryTagAPI';
import client from './axios';

export interface IDiary {
    id: string;
    entry: string;
    date: string;
    tags: IDiaryTag[];
}

interface ListDiaryResponse {
    diaries: IDiary[];
}

interface CreateDiaryRequest {
    entry: string;
    date: string;
    tag_ids: string[];
    user_relation_id: number;
}

export const DiaryAPI = {
    BASE_URL: '/api/diaries/',

    list: async (userRelationId: number): Promise<AxiosResponse<ListDiaryResponse>> => {
        const url = `${DiaryAPI.BASE_URL}?user_relation_id=${userRelationId}`;
        return await client.get(url);
    },
    create: async (props: CreateDiaryRequest): Promise<AxiosResponse<IDiary>> => {
        return await client.post(DiaryAPI.BASE_URL, props, { headers: { 'content-type': 'application/json' } });
    },
};
