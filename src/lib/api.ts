import { post, get, put } from '@/lib/apiClient';
import { authRateLimitExceeded } from '@/lib/RateLimiter';
import {
  ClientRateLimitError,
  NoAccessTokenError,
} from '@/lib/errors/HarmonyErrors';

const ACCESS_TOKEN_STRING = 'harmony_access_token';
const REFRESH_TOKEN_URL = '/auth/refresh_token';
const LOGOUT_URL = '/auth/logout';

export async function getAccessTokenFromApi(): Promise<string> {
  if (authRateLimitExceeded()) throw new ClientRateLimitError();

  const response = await post(REFRESH_TOKEN_URL, null, {
    withCredentials: true,
  });
  return response.data[ACCESS_TOKEN_STRING];
}

export async function logoutOfApi(): Promise<void> {
  return await post(LOGOUT_URL, null, { withCredentials: true });
}

export async function apiUpdater<T>(
  endpoint: string,
  obj: T,
  accessToken: string | undefined
): Promise<T> {
  if (!accessToken) throw new NoAccessTokenError();
  const response = await put<T>(endpoint, obj, {
    headers: { ...(accessToken && { Authorization: `Bearer ${accessToken}` }) },
  });
  return response.data;
}

export default async function swrFetcher<T>(
  url: string,
  accessToken: string | undefined
): Promise<T> {
  if (!accessToken) throw new NoAccessTokenError();
  const response = await get<T>(url, {
    headers: { ...(accessToken && { Authorization: `Bearer ${accessToken}` }) },
  });
  return response.data;
}
