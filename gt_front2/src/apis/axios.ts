import axios from 'axios';

const client = axios.create({
    withCredentials: true,
});

client.interceptors.request.use(config => {
    if (config.method !== undefined && ['post', 'put'].includes(config.method)) {
        config.headers['content-type'] = 'application/json';
    }
    return config;
});

export default client;
