'use client';

import useSWR from 'swr';
import { swrFetcher, swrConfig } from '@/lib/api';
import { Player, PlayerContextType } from '@/types/OrganizationTypes';
import { useAuth } from '@/contexts';

export function usePlayer(orgId: string | undefined): PlayerContextType {
  const PLAYER_URL = `/api/players/@me?orgId=${orgId}`;
  const { accessToken } = useAuth();
  const key = orgId && accessToken ? PLAYER_URL : null;

  const {
    data: player,
    error,
    isLoading,
  } = useSWR<Player>(key, () => swrFetcher(PLAYER_URL, accessToken), swrConfig);

  return {
    player,
    isLoading,
    isError: error,
  };
}
