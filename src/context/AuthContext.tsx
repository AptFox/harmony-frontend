'use client';

import { AuthContextType } from '@/types/auth';
import { createContext, useCallback, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessTokenFromApi, logoutOfApi } from '@/lib/api';
import { mutate } from 'swr';

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [accessTokenIsLoading, setAccessTokenIsLoading] =
    useState<boolean>(true);
  const router = useRouter();

  const getAccessToken = useCallback(async () => {
    setAccessTokenIsLoading(true);
    try {
      const token = await getAccessTokenFromApi(true);
      setAccessToken(token);
    } catch (error: unknown) {
      console.error('unable to login automatically', error);
    } finally {
      setAccessTokenIsLoading(false);
    }
  }, []);

  const clearAccessToken = useCallback(async () => {
    setAccessToken(undefined);
    setAccessTokenIsLoading(false);

    await mutate('/api/user/@me', null, { revalidate: false }); // clear user and prevent future fetches

    await logoutOfApi();

    router.replace('/login');
  }, [setAccessToken, setAccessTokenIsLoading, router]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        accessTokenIsLoading,
        setAccessTokenIsLoading,
        getAccessToken,
        clearAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
