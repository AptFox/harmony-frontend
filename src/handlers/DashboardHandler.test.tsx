/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardHandler from './DashboardHandler';
import { useAuth, usePlayer, useSchedule, useUser } from '@/contexts';
import { mocked } from 'jest-mock';

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('@/contexts');
jest.mock('next/navigation');
jest.mock('@/hooks/useInitialTimeZone');
const useAuthMock = mocked(useAuth, { shallow: true });
const useUserMock = mocked(useUser, { shallow: true });
const useScheduleMock = mocked(useSchedule, { shallow: true });
const usePlayerMock = mocked(usePlayer, { shallow: true });

describe('DashboardHandler', () => {
  describe('user is loading', () => {
    it('shows a loading message', () => {
      useUserMock.mockReturnValue({
        user: undefined,
        isLoading: true,
        isError: undefined,
      } as any);

      const logoutFn = jest.fn();
      useAuthMock.mockReturnValue({
        logout: logoutFn,
      } as any);

      usePlayerMock.mockReturnValue({
        players: undefined,
        teams: [],
      } as any);

      render(<DashboardHandler />);
      expect(screen.getByText(/Dashboard loading.../i)).toBeInTheDocument();
    });
  });

  describe('when user is loaded', () => {
    it('shows user details', () => {
      const testUser = {
        id: 'someId',
        displayName: 'someName',
        timeZoneId: 'America/New_York',
      };
      useScheduleMock.mockReturnValue({
        availability: {
          weeklyAvailabilitySlots: [],
          timeOffs: [],
        },
      } as any);
      useUserMock.mockReturnValue({
        user: testUser,
        isLoading: false,
        isError: undefined,
        avatarUrl: '/someUrl',
      } as any);

      const logoutFn = jest.fn();
      useAuthMock.mockReturnValue({
        logout: logoutFn,
      } as any);

      usePlayerMock.mockReturnValue({
        players: undefined,
        teams: [],
      } as any);

      render(<DashboardHandler />);
      expect(
        screen.getByAltText(`${testUser.displayName}'s avatar`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(testUser.displayName, { exact: true })
      ).toBeInTheDocument();
    });
  });
  describe('when an error occurs while loading the user', () => {
    it('displays a error message', async () => {
      const error = new Error('test');
      useUserMock.mockReturnValue({
        user: undefined,
        avatarUrl: null,
        isLoading: false,
        isError: error,
      } as any);

      const logoutFn = jest.fn();
      useAuthMock.mockReturnValue({
        logout: logoutFn,
      } as any);

      usePlayerMock.mockReturnValue({
        players: undefined,
        teams: [],
      } as any);

      render(<DashboardHandler />);
      expect(screen.getByText('Error loading user data')).toBeInTheDocument();
      // TODO: figure out how to test the toast error message as well likely by mocking useToast
    });
  });

  describe('when logout button is clicked', () => {
    it('redirects to the login page', () => {
      const testUser = {
        id: 'someId',
        displayName: 'someName',
        timeZoneId: 'America/New_York',
      };
      useUserMock.mockReturnValue({
        user: testUser,
        isLoading: false,
        isError: undefined,
      } as any);

      const logoutFn = jest.fn();
      useAuthMock.mockReturnValue({
        logout: logoutFn,
      } as any);

      usePlayerMock.mockReturnValue({
        players: undefined,
        teams: [],
      } as any);

      render(<DashboardHandler />);
      fireEvent.click(screen.getByText(/Logout/, { exact: true }));
      expect(logoutFn).toHaveBeenCalled();
    });
  });
});
