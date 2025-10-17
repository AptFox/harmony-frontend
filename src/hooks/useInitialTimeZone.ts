'use client';

import { useSWRConfig } from 'swr';
import { apiUpdater } from '@/lib/api';
import { useEffect } from 'react';
import { useUser, useAuth, USER_SWR_KEY } from '@/contexts';
import { logWarn } from '@/lib/utils';
import { User } from '@sentry/nextjs';

export function useInitialTimeZone() {
  const { mutate } = useSWRConfig();
  const { user } = useUser();
  const { accessToken } = useAuth();

  useEffect(() => {
    const setInitialTimeZone = () => {
      if (user === undefined || user === null) return;
      if (user.timeZoneId) return; // already set

      const staleUser = user;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const userWithTz: User = { ...user, timeZoneId: tz };

      try {
        mutate(USER_SWR_KEY, userWithTz, false);
        const updatedUser = apiUpdater<User>(
          USER_SWR_KEY,
          userWithTz,
          accessToken
        );
        mutate(USER_SWR_KEY, updatedUser, false);
      } catch (err: unknown) {
        logWarn(err, 'Failed to update timeZoneId');
        mutate(USER_SWR_KEY, staleUser, true);
      }
    };

    setInitialTimeZone();
  }, [accessToken, mutate, user]);
}
