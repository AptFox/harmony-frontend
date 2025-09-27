'use client';

import { createContext, ReactNode, useContext } from 'react';
import useSWR from 'swr';
import swrFetcher from '@/lib/api';
import { User, UserContextType } from '@/types/UserTypes';
import { useAuth } from '@/contexts';
import {
  isForbiddenError,
  isBadRequestError,
  isNotFoundError,
  isApiRateLimitError,
} from '@/lib/utils';

export const USER_SWR_KEY = '/api/user/@me';

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const DISCORD_CDN_URL = 'https://cdn.discordapp.com';
  const { accessToken } = useAuth();

  const {
    data: user,
    error,
    isLoading,
  } = useSWR<User>(USER_SWR_KEY, () => swrFetcher(USER_SWR_KEY, accessToken), {
    errorRetryCount: 3,
    keepPreviousData: true,
    revalidateOnReconnect: true,
    revalidateOnFocus: false,
    shouldRetryOnError: true,
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      if (!key) return;
      if (isForbiddenError(error)) return; // forbidden request, don't retry
      if (isBadRequestError(error)) return; // bad request, don't retry
      if (isNotFoundError(error)) return; // user not found, don't retry
      if (isApiRateLimitError(error)) return; // too many requests, don't retry

      const retryIn = 2 ** retryCount * 1000; // exponential backoff
      console.warn(
        `Error fetching ${key}: ${error.message}. Retrying in ${retryIn}ms.`
      );
      setTimeout(() => revalidate({ retryCount }), retryIn);
    },
  });

  function getDiscordAvatarUrl(user: User | undefined): string | null {
    if (!user) return null;
    if (!user.discordId) return null;

    const discordAvatarHash = user?.discordAvatarHash;
    const discordId = user?.discordId;
    const size = 128;

    if (discordAvatarHash) {
      return `${DISCORD_CDN_URL}/avatars/${discordId}/${discordAvatarHash}.png?size=${size}`;
    } else {
      const defaultAvatarIndex = BigInt(discordId) % 5n;
      return `${DISCORD_CDN_URL}/embed/avatars/${defaultAvatarIndex}.png?size=${size}`;
    }
  }

  const avatarUrl = getDiscordAvatarUrl(user);

  return (
    <UserContext.Provider
      value={{ user, avatarUrl, isLoading, isError: error }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error('useUser must be used within a UserContextProvider');
  return context;
};
