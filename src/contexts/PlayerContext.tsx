'use client';

import { createContext, ReactNode, useContext } from 'react';
import useSWR from 'swr';
import { swrFetcher, swrConfig } from '@/lib/api';
import { Player, PlayerContextType, Team } from '@/types/PlayerTypes';
import { useAuth } from '@/contexts';
import { logInfo, sendErrorToSentry } from '@/lib/utils';

export const PLAYER_URL = '/api/players/@me';

export const PlayerContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { accessToken } = useAuth();
  const key = accessToken ? PLAYER_URL : null;

  const {
    data: players,
    error,
    isLoading,
  } = useSWR<Player[]>(
    key,
    () => swrFetcher(PLAYER_URL, accessToken),
    swrConfig
  );

  if (players && players.length > 1) {
    const errMsg = `Multiple players unsupported. ${players.length} players found.`;
    logInfo(errMsg);
    sendErrorToSentry(new Error(errMsg));
  }

  const teams: Team[] = players
    ? players.map((p) => p.team).filter((team): team is Team => !!team)
    : [];

  return (
    <PlayerContext.Provider
      value={{
        players,
        teams,
        isLoading,
        isError: error,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const PlayerContext = createContext<PlayerContextType | undefined>(
  undefined
);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context)
    throw new Error('usePlayer must be used within a PlayerContextProvider');
  return context;
};
