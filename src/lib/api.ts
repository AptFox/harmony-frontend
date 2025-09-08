import axios from 'axios';

const ACCESS_TOKEN_STRING = 'harmony_access_token';
const REFRESH_TOKEN_URL = '/auth/refresh_token';
const LOGOUT_URL = '/auth/logout';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getAccessTokenFromApi(): Promise<string> {
  const response = await apiClient.post(REFRESH_TOKEN_URL, null, {
    withCredentials: true,
  });
  return response.data[ACCESS_TOKEN_STRING];
}

export async function logoutOfApi(): Promise<void> {
  return await apiClient.post(LOGOUT_URL, null, { withCredentials: true });
}

export default async function swrFetcher<T>(args: string[]): Promise<T> {
  const [url, accessToken] = args;
  const response = await apiClient.get<T>(url, {
    headers: { ...(accessToken && { Authorization: `Bearer ${accessToken}` }) },
  });
  return response.data;
}
