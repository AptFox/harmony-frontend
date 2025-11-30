'use client';

import { useEffect } from 'react';
import { useUser } from '@/contexts';
import { logWarn } from '@/lib/utils';
import { User } from '@/types/UserTypes';

export function useInitialTimeZone() {
  const { user, updateUser } = useUser();

  useEffect(() => {
    const setInitialTimeZone = () => {
      if (user === undefined || user === null) return;
      if (user.timeZoneId) return; // already set

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const userWithTz: User = { ...user, timeZoneId: tz };

      try {
        updateUser(userWithTz);
      } catch (err: unknown) {
        logWarn(err, 'Failed to update timeZoneId');
      }
    };

    setInitialTimeZone();
  }, [updateUser, user]);
}
