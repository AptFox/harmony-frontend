import axios from 'axios';
import { Middleware } from 'swr/_internal';
import { isUnauthorizedError, sendErrorToSentry } from '@/lib/utils';

const ACCESS_TOKEN_STRING = 'harmony_access_token';
const REFRESH_TOKEN_URL = '/auth/refresh_token';
const LOGOUT_URL = '/auth/logout';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getAccessTokenFromApi(
  initialLogin: boolean = false
): Promise<string> {
  const requestArgs = {
    withCredentials: true,
    headers: { 'Initial-Login': `${initialLogin}` },
  };
  const response = await apiClient.post(REFRESH_TOKEN_URL, null, requestArgs);
  return response.data[ACCESS_TOKEN_STRING];
}

export async function logoutOfApi(): Promise<void> {
  return await apiClient.post(LOGOUT_URL, null, { withCredentials: true });
}

// this function is here to set the access token on retry, I might be able to use the onErrorRetry function instead
export function createSwrRetryHandler(
  setAccessToken: (token: string | undefined) => void
): Middleware {
  let refreshPromise: Promise<string | null> | null = null;

  return (useSWRNext) => (key, fetcher, config) => {
    const retryFetcher = async (...args: unknown[]) => {
      try {
        return await fetcher!(...args);
      } catch (error: unknown) {
        // skip retry and propogate error if not 401
        if (!isUnauthorizedError(error)) {
          sendErrorToSentry(error);
          throw error;
        }

        if (!refreshPromise) {
          refreshPromise = (async () => {
            try {
              const newToken = await getAccessTokenFromApi();
              setAccessToken(newToken);
              return newToken;
            } catch (error: unknown) {
              setAccessToken(undefined);
              return null;
            } finally {
              refreshPromise = null;
            }
          })();
        }

        const newToken = await refreshPromise;
        if (!newToken) throw error;

        return await fetcher!(...args); // retry original request
      }
    };

    return useSWRNext(key, retryFetcher, config);
  };
}

export default async function swrFetcher<T>(args: string[]): Promise<T> {
  const [url, accessToken] = args;
  const response = await apiClient.get<T>(url, {
    headers: { ...(accessToken && { Authorization: `Bearer ${accessToken}` }) },
  });
  return response.data;
}
