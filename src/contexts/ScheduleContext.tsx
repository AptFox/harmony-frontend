'use client';

import { createContext, ReactNode, useContext } from 'react';
import useSWR from 'swr';
import swrFetcher from '@/lib/api';
import { Availability, ScheduleContextType } from '@/types/ScheduleTypes';
import { useAuth } from '@/contexts';
import {
  isForbiddenError,
  isBadRequestError,
  isNotFoundError,
  isApiRateLimitError,
  logWarn,
} from '@/lib/utils';

export const SCHEDULE_SWR_KEY = '/api/availability/@me';

export const ScheduleContextProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken } = useAuth();

  const {
    data: availability,
    error,
    isLoading,
  } = useSWR<Availability>(SCHEDULE_SWR_KEY, () => swrFetcher(SCHEDULE_SWR_KEY, accessToken), {
    errorRetryCount: 3,
    keepPreviousData: true,
    revalidateOnReconnect: true,
    revalidateOnFocus: false,
    shouldRetryOnError: true,
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      if (!key) return;
      if (isForbiddenError(error)) return; // forbidden request, don't retry
      if (isBadRequestError(error)) return; // bad request, don't retry
      if (isNotFoundError(error)) return; // schedule not found, don't retry
      if (isApiRateLimitError(error)) return; // too many requests, don't retry

      const retryIn = 2 ** retryCount * 1000; // exponential backoff
      logWarn(
        error,
        `Error fetching ${key}: ${error.message}. Retrying in ${retryIn}ms.`
      );
      setTimeout(() => revalidate({ retryCount }), retryIn);
    },
  });

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
    throw new Error('useSchedule must be used within a ScheduleContextProvider');
  return context;
};
