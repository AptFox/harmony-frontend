import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const post = apiClient.post;
export const get = apiClient.get;
export const put = apiClient.put;