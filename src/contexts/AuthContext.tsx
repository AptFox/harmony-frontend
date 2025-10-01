'use client';

import { AuthContextType } from '@/types/AuthTypes';
import {
  createContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
  useContext,
} from 'react';
import {
  isApiRateLimitError,
  isUnauthorizedError,
  isBadRequestError,
  sendErrorToSentry,
  isClientRateLimitError,
  logError,
} from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { logoutOfApi, getAccessTokenFromApi } from '@/lib/api';
import { useToast } from '@/hooks/UseToast';
import { useSWRConfig } from 'swr';
import { USER_SWR_KEY } from '@/contexts';

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { tooManyRequestsToast } = useToast();
  const { cache, mutate } = useSWRConfig();

  useEffect(() => {
    const initAuth = async () => {
      if (accessToken || hasLoggedOut) return; // Access token is present, no need to refresh
      try {
        const token = await getAccessTokenFromApi();
        setAccessToken(token);
      } catch (error: unknown) {
        if (!isUnauthorizedError(error) && !isBadRequestError(error))
          sendErrorToSentry(error);
        if (isApiRateLimitError(error) || isClientRateLimitError(error)) {
          const rateLimitType = isClientRateLimitError(error)
            ? 'client'
            : 'api';
          logError(error, `${rateLimitType} rate limit triggered`);
          if (pathname !== '/login') {
            tooManyRequestsToast();
          }
          return;
        }

        if (pathname !== '/login') router.replace('/login');
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, hasLoggedOut]);

  const logout = useCallback(async () => {
    // Clear all SWR keys and sessionStorage
    const clearUserCache = () => {
      cache.delete;
      mutate(USER_SWR_KEY, null, { revalidate: false });
    };

    await logoutOfApi();
    setHasLoggedOut(true);
    setAccessToken(undefined);
    clearUserCache();

    router.replace('/login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const triggerDiscordOAuth = () => {
    const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    router.replace(backendBaseUrl + '/oauth2/authorization/discord');
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        logout,
        triggerDiscordOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth must be used within AuthContextProvider');
  return context;
};
