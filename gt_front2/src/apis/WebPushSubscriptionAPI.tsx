import { WebPushSubscriptionFromServer } from '../types/web_push';
import client from './axios';
import type { AxiosResponse } from 'axios';

interface CreateWebPushSubscriptionProps {
    device_name: string;
    endpoint: string;
    expiration_epoch_time: number | null;
    p256dh_key: string;
    auth_key: string;
}

export const WebPushSubscriptionAPI = {
    BASE_URL: '/api/web_push_subscription',

    list: async (): Promise<AxiosResponse<WebPushSubscriptionFromServer | null>> => {
        return await client.get(WebPushSubscriptionAPI.BASE_URL);
    },
    create: async (props: CreateWebPushSubscriptionProps): Promise<AxiosResponse<WebPushSubscriptionFromServer>> => {
        return await client.post(WebPushSubscriptionAPI.BASE_URL, props);
    },
    delete: async (): Promise<AxiosResponse> => {
        return await client.delete(WebPushSubscriptionAPI.BASE_URL);
    },
};
