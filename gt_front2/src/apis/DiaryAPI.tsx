import { AxiosResponse } from 'axios';
import client from './axios';
import { IDiary } from '../contexts/diary-context';

export interface CreateDiaryRequest {
    entry: string;
    date: string;
    tag_ids: string[];
    user_relation_id: number;
}

export interface UpdateDiaryRequest {
    entry: string;
    date: string;
    tag_ids: string[];
}

export const DiaryAPI = {
    BASE_URL: '/api/diaries/',

    list: async (userRelationId: number): Promise<AxiosResponse<IDiary[]>> => {
        const url = `${DiaryAPI.BASE_URL}?user_relation_id=${userRelationId}`;
        return await client.get(url);
    },
    create: async (props: CreateDiaryRequest): Promise<AxiosResponse<IDiary>> => {
        return await client.post(DiaryAPI.BASE_URL, props, { headers: { 'content-type': 'application/json' } });
    },
    update: async (diaryId: string, props: UpdateDiaryRequest): Promise<AxiosResponse<IDiary>> => {
        const url = `${DiaryAPI.BASE_URL}${diaryId}/`;
        return await client.put(url, props, { headers: { 'content-type': 'application/json' } });
    },
    markRead: async (diaryId: string): Promise<AxiosResponse<{}>> => {
        const url = `${DiaryAPI.BASE_URL}${diaryId}/mark_read/`;
        return await client.put(url, {}, { headers: { 'content-type': 'application/json' } });
    }
};
