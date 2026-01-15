import axios, { type AxiosError } from 'axios';

const client = axios.create({
    withCredentials: true,
});

client.interceptors.request.use(config => {
    if (config.method !== undefined && ['post', 'put'].includes(config.method)) {
        config.headers['content-type'] = 'application/json';
    }
    return config;
});

client.interceptors.response.use(
    response => {
        return response;
    },
    async (err: AxiosError) => {
        if (err.response && err.response.status === 401) {
            if (window.location.pathname !== '/login') window.location.pathname = '/login';
        }
        return await Promise.reject(err);
    },
);

export default client;
