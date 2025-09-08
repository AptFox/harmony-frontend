'use client';

import { AuthContextType } from '@/types/auth';
import {
  createContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  isRateLimitError,
  isUnauthorizedError,
  isBadRequestError,
  sendErrorToSentry,
} from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { logoutOfApi, getAccessTokenFromApi } from '@/lib/api';

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      if (accessToken || hasLoggedOut) return; // Access token is present, no need to refresh
      try {
        const token = await getAccessTokenFromApi(false);
        setAccessToken(token);
      } catch (error: unknown) {
        if (!isUnauthorizedError(error) && !isBadRequestError(error))
          sendErrorToSentry(error);
        if (isRateLimitError(error)) return;

        if (pathname !== '/login') router.replace('/login');
      }
    };

    initAuth();
  }, [accessToken, hasLoggedOut, pathname, router]);

  const logout = useCallback(async () => {
    await logoutOfApi();
    setHasLoggedOut(true);
    setAccessToken(undefined);

    router.replace('/login');
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
