import { AxiosResponse } from 'axios';
import { IDiaryTag } from '../contexts/diary-tag-context';
import client from './axios';

interface ListDiaryTagResponse {
    diary_tags: IDiaryTag[];
}

interface GetDiaryTagResponse extends IDiaryTag {
    diary_count: number;
}

interface RequestDiaryTag {
    id: string | null;
    text: string;
    sort_no: number;
}

interface BulkUpdateDiaryTagRequest {
    diary_tags: RequestDiaryTag[];
    user_relation_id: number;
}

interface BulkUpdateDiaryTagResponse {
    diary_tags: IDiaryTag[];
}

export const DiaryTagAPI = {
    BASE_URL: '/api/diary_tags/',

    list: async (userRelationId: number): Promise<AxiosResponse<ListDiaryTagResponse>> => {
        const url = `${DiaryTagAPI.BASE_URL}?user_relation_id=${userRelationId}`;
        return await client.get(url);
    },
    get: async (tagId: string): Promise<AxiosResponse<GetDiaryTagResponse>> => {
        const url = `${DiaryTagAPI.BASE_URL}${tagId}/`;
        return await client.get(url);
    },
    // create: async (props: CreateDiaryRequest): Promise<AxiosResponse<IDiary>> => {
    //     return await client.post(DiaryAPI.BASE_URL, props, { headers: { 'content-type': 'application/json' } });
    // },
    bulkUpdate: async (props: BulkUpdateDiaryTagRequest): Promise<AxiosResponse<BulkUpdateDiaryTagResponse>> => {
        const url = `${DiaryTagAPI.BASE_URL}bulk_update/`;
        return await client.post(url, props, { headers: { 'content-type': 'application/json' } });
    },
    delete: async (tagId: string) => {
        const url = `${DiaryTagAPI.BASE_URL}${tagId}/`;
        return await client.delete(url);
    },
};
