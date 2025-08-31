'use client';

import { AuthContextType } from '@/types/auth';
import { createContext, useCallback, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, logoutOfApi } from '@/lib/api';

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [accessTokenIsLoading, setAccessTokenIsLoading] =
    useState<boolean>(true);
  const router = useRouter();

  const login = async () => {
    try {
      const token = await getAccessToken(true);
      setAccessToken(token);
      setAccessTokenIsLoading(false);
      router.replace('/dashboard');
    } catch (error: unknown) {
      console.log('unable to login automatically'); // get rid of this and eat the error
    }
  };

  const setAccessTokenFn = useCallback(
    async (accessToken: string | undefined) => {
      setAccessToken(accessToken);
      setAccessTokenIsLoading(false);
    },
    []
  );

  const logout = useCallback(async () => {
    setAccessToken(undefined);
    setAccessTokenIsLoading(false);
    await logoutOfApi();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        accessTokenIsLoading,
        setAccessToken: setAccessTokenFn,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
