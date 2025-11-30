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

const useUserMock = mocked(useUser, { shallow: true });
const useAuthMock = mocked(useAuth, { shallow: true });
const apiPutMock = mocked(apiPut<User>, { shallow: true });
const logWarnMock = mocked(logWarn, { shallow: true });

describe('useInitialTimeZone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthMock.mockReturnValue({ accessToken: 'token-abc' } as any);
  });

  it('does nothing when user is undefined', () => {
    const updateUser = jest.fn()
    useUserMock.mockReturnValue({ user: undefined, updateUser } as any);
    renderHook(() => useInitialTimeZone());

    expect(updateUser).not.toHaveBeenCalled();
    expect(apiPutMock).not.toHaveBeenCalled();
    expect(logWarnMock).not.toHaveBeenCalled();
  });

  it('does nothing when user timeZoneId is set', () => {
    const updateUser = jest.fn()
    const user = { id: '1', name: 'Alice', timeZoneId: 'Europe/London' };
    useUserMock.mockReturnValue({ user, updateUser } as any);

    renderHook(() => useInitialTimeZone());

    expect(updateUser).not.toHaveBeenCalled();
    expect(apiPutMock).not.toHaveBeenCalled();
    expect(logWarnMock).not.toHaveBeenCalled();
  });

  it('updates user with new timezone', () => {
    const updateUser = jest.fn();

    const user = { id: '2', name: 'Bob' };
    useUserMock.mockReturnValue({ user, updateUser } as any);

    // mock timezone
    (global as any).Intl = {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'America/Los_Angeles' }),
      }),
    };

    const userWithTz = { ...user, timeZoneId: 'America/Los_Angeles' };
    apiPutMock.mockReturnValue(userWithTz as any);

    renderHook(() => useInitialTimeZone());

    expect(updateUser).toHaveBeenCalledWith(userWithTz);
  });

  it('reverts and logs when updateUser throws', () => {
    const updateUser = jest.fn();
    const user = { id: '3', name: 'Carol' };
    useUserMock.mockReturnValue({ user, updateUser } as any);

    (global as any).Intl = {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'Asia/Tokyo' }),
      }),
    };

    const error = new Error('network');
    updateUser.mockImplementation(() => {
      throw error;
    });

    renderHook(() => useInitialTimeZone());

    const userWithTz = { ...user, timeZoneId: 'Asia/Tokyo' };
    expect(updateUser).toHaveBeenCalledWith(userWithTz);
    expect(logWarn).toHaveBeenCalledWith(error, 'Failed to update timeZoneId');
  });
});
