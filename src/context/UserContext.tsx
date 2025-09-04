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
  });

  return (
    <UserContext.Provider value={{ user: data, isLoading, isError: error }}>
      {children}
    </UserContext.Provider>
  );
};
