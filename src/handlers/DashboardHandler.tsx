'use client';
import { useUser, useAuth, usePlayer } from '@/contexts';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { isApiRateLimitError, isNoAccessTokenError } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useInitialTimeZone } from '@/hooks/useInitialTimeZone';
import ScheduleTable from '@/components/dashboard/scheduleTable';
import TimeOffTable from '@/components/dashboard/timeOffTable';
import TeamScheduleTable from '@/components/dashboard/teamScheduleTable';
import { Spinner } from '@/components/ui/spinner';
import { Team } from '@/types/PlayerTypes'
import PlayerCard from '@/components/dashboard/playerCard';

export default function DashboardHandler() {
  const {
    user,
    avatarUrl,
    isLoading: isLoadingUser,
    isError: isErrorUser,
  } = useUser();
  const {
    players
  } = usePlayer();
  const { logout } = useAuth();
  useInitialTimeZone();

  const teams: Team[] | undefined = players ? players.map( (p) => p.team ).filter((team): team is Team => !!team) : undefined

  useEffect(() => {
    if (isLoadingUser) return;
    if (isNoAccessTokenError(isErrorUser)) return;
    if (isErrorUser) {
      // TODO: centralize error to toasts logic
      if (isApiRateLimitError(isErrorUser)) {
        toast.error('Something went wrong');
        return;
      }
      toast.error(
        `${(isErrorUser as Error).name}: ${(isErrorUser as Error).message}`
      );
    }
  }, [user, isLoadingUser, isErrorUser]);

  return (
    <div className="flex flex-col p-8 mb-24 lg:mb-0 mx-auto w-full lg:max-w-9/10">
      <div className="flex flex-col h-full space-y-2">
        {isLoadingUser && (
          <div className="flex flex-col h-full justify-center">
            <div className="flex flex-row justify-center bg-secondary rounded-lg p-8 border">
              <span className="text-xl font-bold">Dashboard loading...</span>
              <Spinner className="ml-4 size-8" />
            </div>
          </div>
        )}
        {isErrorUser && (
          <div className="flex flex-col h-full justify-center">
            <div className="flex flex-row justify-center bg-red-800 rounded-lg p-8 border">
              <span className="text-xl font-bold">Error loading user data</span>
            </div>
          </div>
        )}
        {user && (
          <div className="flex flex-col justify-top space-y-2">
            <div className="flex justify-between items-center border rounded-lg bg-secondary shadow-md">
              <div className="p-2 flex-row flex">
                <div className="my-2 mr-3 rounded-full border-primary-foreground border-3 max-w-fit">
                  {avatarUrl && (
                    <Image
                      src={avatarUrl}
                      alt={`${user.displayName}'s avatar`}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <p className="font-semibold">{user.displayName}</p>
                </div>
              </div>
              <Button className="m-2" onClick={logout}>
                Logout
              </Button>
            </div>
            <div className="lg:flex lg:flex-row gap-2">
              <ScheduleTable />
              <TimeOffTable />
            </div>
            <div className="lg:flex lg:flex-row gap-2">
              {teams && teams.length > 0 && (<TeamScheduleTable />)}
              {players && (<PlayerCard />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
