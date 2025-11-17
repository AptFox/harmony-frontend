import { post, get, put, apiClientDelete } from '@/lib/apiClient';
import { authRateLimitExceeded } from '@/lib/RateLimiter';
import {
  ClientRateLimitError,
  NoAccessTokenError,
} from '@/lib/errors/HarmonyErrors';
import { AxiosRequestConfig } from 'axios';
import { SWRConfiguration } from 'swr';
import {
  isForbiddenError,
  isBadRequestError,
  isNotFoundError,
  isApiRateLimitError,
  logWarn,
} from '@/lib/utils';

const ACCESS_TOKEN_STRING = 'harmony_access_token';
const REFRESH_TOKEN_URL = '/auth/refresh_token';
const LOGOUT_URL = '/auth/logout';

export async function getAccessTokenFromApi(
  axiosConfig: AxiosRequestConfig
): Promise<string> {
  if (authRateLimitExceeded()) throw new ClientRateLimitError();

  const response = await post(REFRESH_TOKEN_URL, null, {
    signal: axiosConfig.signal,
    withCredentials: true,
  });
  return response.data[ACCESS_TOKEN_STRING];
}

export async function logoutOfApi(): Promise<void> {
  return await post(LOGOUT_URL, null, { withCredentials: true });
}

export async function apiPut<T>(
  endpoint: string,
  accessToken: string | undefined,
  obj: T
): Promise<T> {
  if (!accessToken) throw new NoAccessTokenError();
  const response = await put<T>(endpoint, obj, {
    headers: { ...(accessToken && { Authorization: `Bearer ${accessToken}` }) },
  });
  return response.data;
}

export async function apiPost<T>(
  endpoint: string,
  accessToken: string | undefined,
  obj: T
): Promise<T> {
  if (!accessToken) throw new NoAccessTokenError();
  const response = await post<T>(endpoint, obj, {
    headers: { ...(accessToken && { Authorization: `Bearer ${accessToken}` }) },
  });
  return response.data;
}

export async function apiDelete<T>(
  endpoint: string,
  accessToken: string | undefined
): Promise<T> {
  if (!accessToken) throw new NoAccessTokenError();
  const response = await apiClientDelete<T>(endpoint, {
    headers: { ...(accessToken && { Authorization: `Bearer ${accessToken}` }) },
  });
  return response.data;
}

export async function swrFetcher<T>(
  url: string,
  accessToken: string | undefined
): Promise<T> {
  if (!accessToken) throw new NoAccessTokenError();
  const response = await get<T>(url, {
    headers: { ...(accessToken && { Authorization: `Bearer ${accessToken}` }) },
  });
  return response.data;
}

export const swrConfig: SWRConfiguration = {
  errorRetryCount: 3,
  keepPreviousData: true,
  revalidateOnReconnect: true,
  revalidateOnFocus: false,
  shouldRetryOnError: true,
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    if (!key) return;
    if (isForbiddenError(error)) return; // forbidden request, don't retry
    if (isBadRequestError(error)) return; // bad request, don't retry
    if (isNotFoundError(error)) return; // schedule not found, don't retry
    if (isApiRateLimitError(error)) return; // too many requests, don't retry

    const retryIn = 2 ** retryCount * 1000; // exponential backoff
    logWarn(
      error,
      `Error fetching ${key}: ${error.message}. Retrying in ${retryIn}ms.`
    );
    setTimeout(() => revalidate({ retryCount }), retryIn);
  },
};
