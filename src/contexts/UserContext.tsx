'use client';

import { createContext, ReactNode, useContext } from 'react';
import useSWR, { mutate } from 'swr';
import { swrFetcher, swrConfig, apiPut } from '@/lib/api';
import { User, UserContextType } from '@/types/UserTypes';
import { useAuth } from '@/contexts';

export const USER_SWR_KEY = '/api/user/@me';
const DISCORD_CDN_URL = 'https://cdn.discordapp.com';

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

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken } = useAuth();
  const key = accessToken ? USER_SWR_KEY : null;
  const {
    data: user,
    error,
    isLoading,
  } = useSWR<User>(key, () => swrFetcher(USER_SWR_KEY, accessToken), swrConfig);

  const updateUser = (userToUpdate: User) => {
    const staleUser = user;
    try {
      mutate(USER_SWR_KEY, userToUpdate, false);
      const updatedUser = apiPut<User>(USER_SWR_KEY, accessToken, userToUpdate);
      mutate(USER_SWR_KEY, updatedUser, false);
    } catch (err: unknown) {
      mutate(USER_SWR_KEY, staleUser, true);
      throw err;
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        updateUser,
        avatarUrl: getDiscordAvatarUrl(user),
        isLoading,
        isError: error,
      }}
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
