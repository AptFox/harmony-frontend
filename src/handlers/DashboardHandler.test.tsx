/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardHandler from './DashboardHandler';
import { useAuth, useUser } from '@/hooks';
import { useRouter } from 'next/navigation';
import { mocked } from 'jest-mock';

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('@/hooks');
jest.mock('next/navigation');
const useAuthMock = mocked(useAuth, { shallow: true });
const useUserMock = mocked(useUser, { shallow: true });
const useRouterMock = mocked(useRouter, { shallow: true });

describe('DashboardHandler', () => {
  describe('user is loading', () => {
    it('shows a loading message', () => {
      useUserMock.mockReturnValue({
        user: undefined,
        isLoading: true,
        isError: undefined,
      } as any);

      const pushFn = jest.fn();
      useRouterMock.mockReturnValue({
        push: pushFn,
      } as any);

      const logoutFn = jest.fn();
      useAuthMock.mockReturnValue({
        logout: logoutFn,
      } as any);

      render(<DashboardHandler />);
      expect(screen.getByText(/Dashboard loading.../i)).toBeInTheDocument();
      expect(pushFn).not.toHaveBeenCalled();
    });
  });

  describe('when user is loaded', () => {
    it('shows a welcome message and user details', () => {
      const testUser = { id: 'someId', displayName: 'someName' };
      useUserMock.mockReturnValue({
        user: testUser,
        isLoading: false,
        isError: undefined,
      } as any);

      const pushFn = jest.fn();
      useRouterMock.mockReturnValue({
        push: pushFn,
      } as any);

      const logoutFn = jest.fn();
      useAuthMock.mockReturnValue({
        logout: logoutFn,
      } as any);

      render(<DashboardHandler />);
      expect(
        screen.getByText(`Hello, ${testUser.displayName}`, { exact: true })
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Details: ${JSON.stringify(testUser)}`, {
          exact: true,
        })
      );
      expect(pushFn).not.toHaveBeenCalled();
    });
  });
  describe('when an error occurs while loading the user', () => {
    it('redirects to the login page', async () => {
      const error = { name: 'someError', message: 'someMessage' };
      useUserMock.mockReturnValue({
        user: undefined,
        isLoading: false,
        isError: error,
      } as any);

      const replaceFn = jest.fn();
      useRouterMock.mockReturnValue({
        replace: replaceFn,
      } as any);

      const logoutFn = jest.fn();
      useAuthMock.mockReturnValue({
        logout: logoutFn,
      } as any);

      render(<DashboardHandler />);
      // TODO: figure out how to test the toast error message
      expect(replaceFn).toHaveBeenCalledWith('/login');
    });
  });

  describe('when logout button is clicked', () => {
    it('redirects to the login page', () => {
      useUserMock.mockReturnValue({
        user: undefined,
        isLoading: false,
        isError: undefined,
      } as any);

      const loginFn = jest.fn();
      const replaceFn = jest.fn();
      useRouterMock.mockReturnValue({
        login: loginFn,
        replace: replaceFn,
      } as any);

      const clearAccessTokenFn = jest.fn();
      useAuthMock.mockReturnValue({
        clearAccessToken: clearAccessTokenFn,
      } as any);

      render(<DashboardHandler />);
      fireEvent.click(screen.getByText('Logout', { exact: true }));
      expect(clearAccessTokenFn).toHaveBeenCalled();
      expect(loginFn).not.toHaveBeenCalled();
    });
  });
});
