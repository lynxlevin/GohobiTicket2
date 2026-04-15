import { AxiosResponse } from 'axios';
import client from './axios';
import { IUser } from '../types/user';

interface LoginProps {
    email: string;
    password: string;
}

export const UserAPI = {
    BASE_URL: '/api/users',

    login: async (data: LoginProps) => {
        const url = `${UserAPI.BASE_URL}/login`;
        return await client.post(url, data);
    },
    session: async (): Promise<AxiosResponse<IUser>> => {
        const url = `${UserAPI.BASE_URL}/me`;
        return await client.get(url);
    },
    logout: async () => {
        const url = `${UserAPI.BASE_URL}/logout`;
        return await client.post(url, {});
    },
};
