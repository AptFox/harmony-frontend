'use client';

import { createContext, ReactNode, useContext } from 'react';
import useSWR, { mutate } from 'swr';
import { swrFetcher, swrConfig, apiPost, apiDelete } from '@/lib/api';
import { Availability, ScheduleContextType, ScheduleSlotRequest } from '@/types/ScheduleTypes';
import { useAuth } from '@/contexts';
import { logError } from '@/lib/utils';

export const SCHEDULE_SWR_KEY = '/api/availability/@me';
const WEEKLY_SCHEDULE_URL = '/api/availability/weekly'

export const ScheduleContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
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

  const overwriteSchedule = async (slots: ScheduleSlotRequest[]) => {
    try {
      const updatedSchedule = await apiPost<ScheduleSlotRequest[]>(WEEKLY_SCHEDULE_URL, accessToken, slots)
      mutate(SCHEDULE_SWR_KEY, updatedSchedule, true);
    } catch (err: unknown) {
      logError(err, 'Schedule overwrite failed.')
      throw err;
    }
  }

  const deleteSchedule = async () => {
    try {
      await apiDelete(WEEKLY_SCHEDULE_URL, accessToken)
      mutate(SCHEDULE_SWR_KEY, null, true);
    } catch (err: unknown) {
      logError(err, 'Schedule delete failed.')
      throw err;
    }
  }

  return (
    <ScheduleContext.Provider
      value={{ availability, overwriteSchedule, deleteSchedule, isLoading, isError: error }}
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
