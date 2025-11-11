'use client';
import { useUser, useAuth } from '@/contexts';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { isApiRateLimitError, isNoAccessTokenError } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useInitialTimeZone } from '@/hooks/useInitialTimeZone';
import ScheduleTable from '@/components/dashboard/scheduleTable';
import TimeOffTable from '@/components/dashboard/timeOffTable';

export default function DashboardHandler() {
  const {
    user,
    avatarUrl,
    isLoading: isLoadingUser,
    isError: isErrorUser,
  } = useUser();
  const twelveHourClock =
    user?.twelveHourClock === undefined ? true : user?.twelveHourClock; // TODO: get this from user object
  const { logout } = useAuth();
  useInitialTimeZone();

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
    <div className="flex flex-col p-8 mx-auto h-lvh w-full lg:max-w-9/10">
      <div className="flex flex-col h-full space-y-2">
        {isLoadingUser && (
          <div className="flex flex-col h-full justify-center">
            <p className="text-center">Dashboard loading...</p>
          </div>
        )}
        {isErrorUser && (
          <div className="flex flex-col h-full justify-center">
            <p className="text-center">Error loading user data</p>
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
                  <p className="text-sm">[team name]</p>
                  <p className="text-sm">[team role]</p>
                </div>
              </div>
              <Button className="m-2" onClick={logout}>
                Logout
              </Button>
            </div>
            <div className="lg:flex lg:flex-row gap-2">
              <ScheduleTable twelveHourClock={twelveHourClock} />
              <TimeOffTable twelveHourClock={twelveHourClock} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
