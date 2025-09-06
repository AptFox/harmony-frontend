'use client';

import { AuthContextType } from '@/types/auth';
import {
  createContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { isRateLimitError, sendErrorToSentry } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { getAccessTokenFromApi, logoutOfApi } from '@/lib/api';
import { mutate } from 'swr';

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [accessTokenIsLoading, setAccessTokenIsLoading] =
    useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // If the user is already on the login page, don't redirect them again
  const isOnLoginPage = pathname === '/login';

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getAccessTokenFromApi(false);
        setAccessToken(token);
      } catch (error: unknown) {
        console.error('unable to refresh access token', error);
        sendErrorToSentry(error);

        if (isRateLimitError(error)) return;

        setAccessToken(undefined);

        if (isOnLoginPage) return;
        router.replace('/login');
      } finally {
        setAccessTokenIsLoading(false);
      }
    };

    initAuth();
  }, [isOnLoginPage, router]);

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

  const triggerBackendOAuth = () => {
    const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    router.replace(backendBaseUrl + '/oauth2/authorization/discord');
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        accessTokenIsLoading,
        setAccessTokenIsLoading,
        getAccessToken,
        clearAccessToken,
        triggerBackendOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
