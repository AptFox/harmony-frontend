'use client';

import { createContext, ReactNode, useMemo } from 'react';
import useSWR from 'swr';
import swrFetcher, { createSwrRetryHandler } from '@/lib/api';
import { User, UserContextType } from '@/types/User';
import { useAuth } from '@/hooks/useAuth';

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, setAccessToken } = useAuth();

  const swrKey = useMemo(
    () => (accessToken ? ['/api/user/@me', accessToken] : null),
    [accessToken]
  );

  const retryHandler = createSwrRetryHandler(setAccessToken);

  const { data, error, isLoading } = useSWR<User>(swrKey, swrFetcher, {
    shouldRetryOnError: false,
    use: [retryHandler],
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      if (!key) return;
      if (error.status === 401 || error.status === 403) return;
      if (error.status === 400) return; // bad request, don't retry
      if (error.status === 404) return; // user not found, don't retry
      if (error.status === 429) return; // too many requests, don't retry
      // Never retry more than 3 times.
      if (retryCount >= 3) return;

      const retryIn = 2 ** retryCount * 1000; // exponential backoff
      console.warn(
        `Error fetching ${key}: ${error.message}. Retrying in ${retryIn}ms.`
      );
      setTimeout(() => revalidate({ retryCount }), retryIn);
    },
  });

  return (
    <UserContext.Provider value={{ user: data, isLoading, isError: error }}>
      {children}
    </UserContext.Provider>
  );
};
