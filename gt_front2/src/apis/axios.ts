import axios from 'axios';

const client = axios.create({
    withCredentials: true,
});

client.interceptors.request.use(async config => {
    return config;
});

export default client;
