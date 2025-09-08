/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardHandler from './DashboardHandler';
import { useAuth, useUser } from '@/hooks';
import { mocked } from 'jest-mock';

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('@/hooks');
jest.mock('next/navigation');
const useAuthMock = mocked(useAuth, { shallow: true });
const useUserMock = mocked(useUser, { shallow: true });

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

      render(<DashboardHandler />);
      expect(screen.getByText(/Dashboard loading.../i)).toBeInTheDocument();
    });
  });

  describe('when user is loaded', () => {
    it('shows a welcome message, user avatar and user details', () => {
      const testUser = { id: 'someId', displayName: 'someName' };
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

      render(<DashboardHandler />);
      expect(
        screen.getByAltText(`${testUser.displayName}'s avatar`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Hello, ${testUser.displayName}`, { exact: true })
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Details: ${JSON.stringify(testUser)}`, {
          exact: true,
        })
      );
    });
  });
  describe('when an error occurs while loading the user', () => {
    it('displays a toast message', async () => {
      const error = { name: 'someError', message: 'someMessage' };
      useUserMock.mockReturnValue({
        user: undefined,
        avatarUrl: null,
        isLoading: false,
        isError: error,
      } as any);

      render(<DashboardHandler />);
      expect(screen.getByText('Error loading user data')).toBeInTheDocument();
      // TODO: figure out how to test the toast error message as well likely by mocking useToast
    });
  });

  describe('when logout button is clicked', () => {
    it('redirects to the login page', () => {
      useUserMock.mockReturnValue({
        user: undefined,
        isLoading: false,
        isError: undefined,
      } as any);

      const logoutFn = jest.fn();
      useAuthMock.mockReturnValue({
        logout: logoutFn,
      } as any);

      render(<DashboardHandler />);
      fireEvent.click(screen.getByText('Logout', { exact: true }));
      expect(logoutFn).toHaveBeenCalled();
    });
  });
});
