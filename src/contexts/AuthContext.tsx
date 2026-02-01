'use client';

import { AuthContextType } from '@/types/AuthTypes';
import {
  createContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
  useContext,
  useRef,
} from 'react';
import {
  isApiRateLimitError,
  isUnauthorizedError,
  isBadRequestError,
  sendErrorToSentry,
  isClientRateLimitError,
  logError,
  logInfo,
  isProdEnv,
} from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { logoutOfApi, getAccessTokenFromApi } from '@/lib/api';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { USER_SWR_KEY } from '@/contexts';

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(accessToken === undefined);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const hasInitializedAuthRef = useRef(false);
  const hasInitializedLogoutRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const { cache, mutate } = useSWRConfig();

  useEffect(() => {
    if (!isProdEnv() && hasInitializedAuthRef.current) {
      logInfo('Strict Mode: Skipping duplicate auth call');
      return;
    }

    hasInitializedAuthRef.current = true;
    const controller = new AbortController();
    const initAuth = async () => {
      if (accessToken || hasLoggedOut) return; // Access token is present, no need to refresh
      try {
        const token = await getAccessTokenFromApi({
          signal: controller.signal,
        });
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
            toast.error(
              'Too Many Requests: You are refreshing the page too often.'
            );
          }
          return;
        }

        if (pathname !== '/login') router.replace('/login');
      }
      setIsLoading(false);
    };

    initAuth();
    return () => {
      logInfo('AuthContext UNMOUNTED');
      // controller.abort(); // TODO: This doesn't work because of an extra unexpected mount/unmount, need to find it somehow
    };
  }, [accessToken, hasLoggedOut, pathname, router]);

  const logout = useCallback(async () => {
    if (!isProdEnv() && hasInitializedLogoutRef.current) {
      logInfo('Strict Mode: Skipping duplicate logout call');
      return;
    }
    hasInitializedLogoutRef.current = true;
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
        isLoading,
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
