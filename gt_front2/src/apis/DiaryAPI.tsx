import { AxiosResponse } from 'axios';
import client from './axios';
import { IDiary } from '../types/diary';
import { format } from 'date-fns';

export interface ListDiariesRequest {
    userRelationId: number;
    dateGte?: Date;
    dateLte?: Date;
}

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

    list: async ({ userRelationId, dateGte, dateLte }: ListDiariesRequest): Promise<AxiosResponse<IDiary[]>> => {
        let url = DiaryAPI.BASE_URL;
        const queries = [`user_relation_id=${userRelationId}`];
        if (dateGte) {
            queries.push(`date_gte=${format(dateGte, 'yyyy-MM-dd')}`);
        }
        if (dateLte) {
            queries.push(`date_lte=${format(dateLte, 'yyyy-MM-dd')}`);
        }
        if (queries.length > 0) {
            url += `?${queries.join('&')}`;
        }
        return await client.get(url);
    },
    create: async (props: CreateDiaryRequest): Promise<AxiosResponse<IDiary>> => {
        return await client.post(DiaryAPI.BASE_URL, props);
    },
    update: async (diaryId: string, props: UpdateDiaryRequest): Promise<AxiosResponse<IDiary>> => {
        const url = `${DiaryAPI.BASE_URL}${diaryId}/`;
        return await client.put(url, props);
    },
    markRead: async (diaryId: string): Promise<AxiosResponse<{}>> => {
        const url = `${DiaryAPI.BASE_URL}${diaryId}/mark_read/`;
        return await client.put(url, {});
    },
};
