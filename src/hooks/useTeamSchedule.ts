import { useAuth } from '@/contexts';
import { swrConfig, swrFetcher } from '@/lib/api';
import { TeamSchedule, TeamScheduleContextType } from '@/types/ScheduleTypes';
import useSWR from 'swr';

export function useTeamSchedule(
  teamId: string | null
): TeamScheduleContextType {
  const { accessToken } = useAuth();
  const teamScheduleUrl = `/api/availability/weekly/team/${teamId}`;
  const TEAM_SCHEDULE_SWR_KEY = teamId && accessToken ? teamScheduleUrl : null;

  const { data, error, isLoading } = useSWR<TeamSchedule>(
    TEAM_SCHEDULE_SWR_KEY,
    () => swrFetcher(teamScheduleUrl, accessToken),
    swrConfig
  );

  return {
    teamSchedule: data,
    isLoading,
    isError: error,
  };
}
