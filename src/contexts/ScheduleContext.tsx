'use client';

import { createContext, ReactNode, useContext } from 'react';
import useSWR, { mutate } from 'swr';
import { swrFetcher, swrConfig, apiPost, apiDelete } from '@/lib/api';
import {
  Availability,
  ScheduleContextType,
  ScheduleSlotRequest,
  TimeOff,
  TimeOffRequest,
} from '@/types/ScheduleTypes';
import { useAuth } from '@/contexts';
import { isScheduleError, logError } from '@/lib/utils';

export const SCHEDULE_SWR_KEY = '/api/availability/@me';
const WEEKLY_SCHEDULE_URL = '/api/availability/weekly';
const TIME_OFF_URL = '/api/availability/time_off';

export const ScheduleContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // TODO: separate timeOff into it's own context to simplify this logic and prevent UI refreshes on every delete
  const { accessToken } = useAuth();
  const key = accessToken ? SCHEDULE_SWR_KEY : null;

  const {
    data: availability,
    error,
    isLoading,
  } = useSWR<Availability>(
    key,
    () => swrFetcher(SCHEDULE_SWR_KEY, accessToken),
    swrConfig
  );

  const triggerAllScheduleKeyRefresh = async () => {
    const mutateFilterFn = function (key: string) {
      return key.includes('/api/availability');
    };
    await mutate(mutateFilterFn, null, true);
  };

  const overwriteSchedule = async (
    slots: ScheduleSlotRequest[]
  ): Promise<string[] | void> => {
    try {
      await apiPost<ScheduleSlotRequest[]>(
        WEEKLY_SCHEDULE_URL,
        accessToken,
        slots
      );
      triggerAllScheduleKeyRefresh();
    } catch (err: unknown) {
      if (isScheduleError(err)) {
        const apiErrors: undefined | string[] = err?.response?.data?.errors;
        if (apiErrors) {
          logError(apiErrors, 'Schedule overwrite failed.');
          return apiErrors;
        }
      }
      throw err;
    }
  };

  const deleteSchedule = async () => {
    try {
      await apiDelete(WEEKLY_SCHEDULE_URL, accessToken);
      triggerAllScheduleKeyRefresh();
    } catch (err: unknown) {
      logError(err, 'Schedule delete failed.');
      throw err;
    }
  };

  const addTimeOff = async (
    timeOff: TimeOffRequest
  ): Promise<string[] | void> => {
    try {
      await apiPost(TIME_OFF_URL, accessToken, timeOff);
      triggerAllScheduleKeyRefresh();
    } catch (err: unknown) {
      if (isScheduleError(err)) {
        const apiErrors: undefined | string[] = err?.response?.data?.errors;
        if (apiErrors) {
          logError(apiErrors, 'Adding timeOff failed.');
          return apiErrors;
        }
      }

      throw err;
    }
  };

  const deleteTimeOff = async (timeOff: TimeOff): Promise<string[] | void> => {
    try {
      const deleteUrl: string = `${TIME_OFF_URL}\\${timeOff.id}`;
      await apiDelete(deleteUrl, accessToken);
      triggerAllScheduleKeyRefresh();
    } catch (err: unknown) {
      if (isScheduleError(err)) {
        const apiErrors: undefined | string[] = err?.response?.data?.errors;
        if (apiErrors) {
          logError(apiErrors, 'Deleting timeOff failed.');
          return apiErrors;
        }
      }

      throw err;
    }
  };

  return (
    <ScheduleContext.Provider
      value={{
        availability,
        overwriteSchedule,
        deleteSchedule,
        addTimeOff,
        deleteTimeOff,
        isLoading,
        isError: error,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
);

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context)
    throw new Error(
      'useSchedule must be used within a ScheduleContextProvider'
    );
  return context;
};
