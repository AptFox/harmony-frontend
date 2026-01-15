'use client';
import { useUser, useAuth } from '@/contexts';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { isApiRateLimitError, isNoAccessTokenError } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useInitialTimeZone } from '@/hooks/useInitialTimeZone';
import ScheduleTable from '@/components/dashboard/scheduleTable';
import TimeOffTable from '@/components/dashboard/timeOffTable';
import { Spinner } from '@/components/ui/spinner';
import PlayerCard from '@/components/dashboard/playerCard';
import FranchiseScheduleTable from '@/components/dashboard/franchiseScheduleTable';
import TeamScheduleCard from '@/components/dashboard/teamScheduleCard';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DashboardHandler() {
  const {
    user,
    avatarUrl,
    isLoading: isLoadingUser,
    isError: isErrorUser,
  } = useUser();
  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>();
    const { logout } = useAuth();
  useInitialTimeZone();

  useEffect(() => {
    if (isLoadingUser) return;
    if (user?.organizations && user.organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(user.organizations[0].id);
    }
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
  }, [user, isLoadingUser, isErrorUser, selectedOrgId]);

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
              <div className="grid grid-flow-col gap-2 p-2">
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
                <div className="flex flex-col justify-center">
                  <Select
                    disabled={isLoadingUser || user?.organizations.length == 1}
                    value={selectedOrgId}
                    onValueChange={setSelectedOrgId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Org" />
                    </SelectTrigger>
                    <SelectContent
                      position="item-aligned"
                    >
                      <SelectGroup>
                        {user.organizations.map((org, i) => (
                          <SelectItem key={i} value={org.id}>
                            {org.acronym}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="m-2" onClick={logout}>
                Logout
              </Button>
            </div>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <ScheduleTable />
                <TimeOffTable />
                {selectedOrgId && (<PlayerCard orgId={selectedOrgId} />)}
                {selectedOrgId && (<TeamScheduleCard orgId={selectedOrgId} />)}
                {selectedOrgId && (<FranchiseScheduleTable orgId={selectedOrgId} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
