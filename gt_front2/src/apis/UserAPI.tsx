import { AxiosResponse } from 'axios';
import client from './axios';

interface LoginProps {
    email: string;
    password: string;
}

interface SessionResponse {
    is_authenticated: boolean;
}

export const UserAPI = {
    BASE_URL: '/api/users',

    login: async (data: LoginProps) => {
        const url = `${UserAPI.BASE_URL}/login`;
        return await client.post(url, data);
    },
    session: async (): Promise<AxiosResponse<SessionResponse>> => {
        const url = `${UserAPI.BASE_URL}/me`;
        return await client.get(url);
    },
    logout: async () => {
        const url = `${UserAPI.BASE_URL}/logout`;
        return await client.post(url, {});
    },
};
