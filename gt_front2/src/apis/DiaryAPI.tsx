import { AxiosResponse } from 'axios';
import { IDiaryTag } from '../contexts/diary-tag-context';
import client from './axios';

export type DiaryStatus = "unread" | "edited" | "read"

export interface IDiary {
    id: string;
    entry: string;
    date: string;
    tags: IDiaryTag[];
    status: DiaryStatus;
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

interface UpdateDiaryRequest {
    entry: string;
    date: string;
    tag_ids: string[];
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
    update: async (diaryId: string, props: UpdateDiaryRequest): Promise<AxiosResponse<IDiary>> => {
        const url = `${DiaryAPI.BASE_URL}${diaryId}/`;
        return await client.put(url, props, { headers: { 'content-type': 'application/json' } });
    },
    markRead: async (diaryId: string): Promise<AxiosResponse<{}>> => {
        const url = `${DiaryAPI.BASE_URL}${diaryId}/mark_read/`;
        return await client.put(url, {}, { headers: { 'content-type': 'application/json' } });
    }
};
