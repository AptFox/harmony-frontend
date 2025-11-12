'use client';

import { createContext, ReactNode, useContext } from 'react';
import useSWR from 'swr';
import { swrFetcher, swrConfig } from '@/lib/api';
import { Availability, ScheduleContextType } from '@/types/ScheduleTypes';
import { useAuth } from '@/contexts';

export const SCHEDULE_SWR_KEY = '/api/availability/@me';

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

  return (
    <ScheduleContext.Provider
      value={{ availability, isLoading, isError: error }}
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
