'use client';

import useSWR from 'swr';
import { swrFetcher, swrConfig } from '@/lib/api';
import { TeamsContextType, Team } from '@/types/OrganizationTypes';
import { useAuth } from '@/contexts';

export function useTeams(franchiseId: string | undefined): TeamsContextType {
  const TEAM_URL = `/api/teams?franchiseId=${franchiseId}`;
  const { accessToken } = useAuth();
  const key = franchiseId && accessToken ? TEAM_URL : null;

  const {
    data: franchiseTeams,
    error,
    isLoading,
  } = useSWR<Team[]>(
    key,
    () => swrFetcher(TEAM_URL, accessToken),
    swrConfig
  );

  return {
    franchiseTeams,
    isLoading,
    isError: error,
  };
}
