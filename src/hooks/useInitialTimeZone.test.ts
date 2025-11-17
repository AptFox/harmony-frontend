/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react';
import { useInitialTimeZone } from './useInitialTimeZone';
import { useSWRConfig } from 'swr';
import { useUser, useAuth, USER_SWR_KEY } from '@/contexts';
import { apiPut } from '@/lib/api';
import { logWarn } from '@/lib/utils';
import { mocked } from 'jest-mock';
import { User } from '@/types/UserTypes';

jest.mock('swr');
jest.mock('@/contexts');
jest.mock('@/lib/api');
jest.mock('@/lib/utils');

const useSWRConfigMock = mocked(useSWRConfig, { shallow: true });
const useUserMock = mocked(useUser, { shallow: true });
const useAuthMock = mocked(useAuth, { shallow: true });
const apiPutMock = mocked(apiPut<User>, { shallow: true });
const logWarnMock = mocked(logWarn, { shallow: true });

describe('useInitialTimeZone', () => {
  // TODO: rewrite this test
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthMock.mockReturnValue({ accessToken: 'token-abc' } as any);
  });

  it('does nothing when user is undefined', () => {
    const mutate = jest.fn();
    useSWRConfigMock.mockReturnValue({ mutate } as any);
    useUserMock.mockReturnValue({ user: undefined } as any);

    renderHook(() => useInitialTimeZone());

    expect(mutate).not.toHaveBeenCalled();
    expect(apiPutMock).not.toHaveBeenCalled();
    expect(logWarnMock).not.toHaveBeenCalled();
  });

  it('does nothing when user timeZoneId is set', () => {
    const mutate = jest.fn();
    const user = { id: '1', name: 'Alice', timeZoneId: 'Europe/London' };
    useSWRConfigMock.mockReturnValue({ mutate } as any);
    useUserMock.mockReturnValue({ user } as any);

    renderHook(() => useInitialTimeZone());

    expect(mutate).not.toHaveBeenCalled();
    expect(apiPutMock).not.toHaveBeenCalled();
    expect(logWarnMock).not.toHaveBeenCalled();
  });

  it('updates swr before and after api call', () => {
    const mutate = jest.fn();
    useSWRConfigMock.mockReturnValue({ mutate } as any);

    const user = { id: '2', name: 'Bob' };
    useUserMock.mockReturnValue({ user } as any);

    // mock timezone
    (global as any).Intl = {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'America/Los_Angeles' }),
      }),
    };

    const userWithTz = { ...user, timeZoneId: 'America/Los_Angeles' };
    apiPutMock.mockReturnValue(userWithTz as any);

    renderHook(() => useInitialTimeZone());

    expect(mutate).toHaveBeenNthCalledWith(1, USER_SWR_KEY, userWithTz, false);
    expect(apiPut).toHaveBeenCalledWith(USER_SWR_KEY, userWithTz, 'token-abc');
    // figure out why this mutate call fails, I think it's because of a failing mock
    expect(mutate).toHaveBeenNthCalledWith(2, USER_SWR_KEY, userWithTz, false);
  });

  it('reverts and logs when apiPut throws', () => {
    const mutate = jest.fn();
    useSWRConfigMock.mockReturnValue({ mutate } as any);

    const user = { id: '3', name: 'Carol' };
    useUserMock.mockReturnValue({ user } as any);

    (global as any).Intl = {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'Asia/Tokyo' }),
      }),
    };

    const error = new Error('network');
    apiPutMock.mockImplementation(() => {
      throw error;
    });

    renderHook(() => useInitialTimeZone());

    const userWithTz = { ...user, timeZoneId: 'Asia/Tokyo' };
    expect(mutate).toHaveBeenNthCalledWith(1, USER_SWR_KEY, userWithTz, false);
    expect(logWarn).toHaveBeenCalledWith(error, 'Failed to update timeZoneId');
    expect(mutate).toHaveBeenNthCalledWith(2, USER_SWR_KEY, user, true);
  });
});
