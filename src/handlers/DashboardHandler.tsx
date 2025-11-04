'use client';
import { useUser, useAuth, useSchedule } from '@/contexts';
import { useToast } from '@/hooks/UseToast';
import { useEffect } from 'react';
import { isApiRateLimitError, isNoAccessTokenError } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useInitialTimeZone } from '@/hooks/useInitialTimeZone';
import DashboardCard from '@/components/dashboard/dashboardCard';
import ScheduleTable from '@/components/dashboard/scheduleTable';

export default function DashboardHandler() {
  // TODO: split this file into components
  const { user, avatarUrl, isLoading: isLoadingUser, isError: isErrorUser } = useUser();
  const { logout } = useAuth();
  const { toast, tooManyRequestsToast } = useToast();
  const { availability, isLoading: isLoadingAvailability, isError: isErrorAvailability } = useSchedule();
  useInitialTimeZone();

  useEffect(() => {
    if (isLoadingUser) return;
    if (isNoAccessTokenError(isErrorUser)) return;
    if (isErrorUser) {
      // TODO: add logic that inspects the error and prints a standard pretty message
      if (isApiRateLimitError(isErrorUser)) {
        tooManyRequestsToast();
        return;
      }
      toast({
        title: (isErrorUser as Error).name,
        description: (isErrorUser as Error).message,
        variant: 'destructive',
      });
    }
  }, [user, isLoadingUser, isErrorUser, toast, tooManyRequestsToast]);

  return (
    <div className="min-h-screen flex flex-col p-8">
      <div className="flex flex-col justify-center space-y-2">
        {isLoadingUser && (
          <div>
            <p>Dashboard loading...</p>
          </div>
        )}
        {isErrorUser && !isNoAccessTokenError(isErrorUser) && (
          <div>
            <p>Error loading user data</p>
          </div>
        )}
        {user && (
          <div className="flex flex-col justify-center space-y-2">
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
            <Button className="m-2" onClick={logout}>Logout</Button>
          </div>
        
          <div className="lg:flex lg:flex-row gap-2">
            <ScheduleTable availability={availability} />
            <DashboardCard title="Time off" buttonText="Add">
              <span className="text-muted-foreground">
                [Time off Placeholder]
              </span>
            </DashboardCard>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
