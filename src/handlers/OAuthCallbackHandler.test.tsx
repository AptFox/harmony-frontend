/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import OAuthCallbackHandler from './OAuthCallbackHandler';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { mocked } from 'jest-mock';

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('@/hooks/useAuth');
jest.mock('next/navigation');
const useAuthMock = mocked(useAuth, { shallow: true });
const useRouterMock = mocked(useRouter, { shallow: true });

describe('OAuthCallbackHandler', () => {
  describe('accessToken is loading', () => {
    it('renders a placeholder message while attempting login', () => {
      // TODO: figure out how to simplify this mock, maybe spread or something
      // TODO: make generic mocks
      // TODO: Make mock factory with sensible default
      const loginFn = jest.fn();
      const replaceFn = jest.fn();
      useAuthMock.mockReturnValue({
        login: loginFn,
        accessToken: undefined,
        accessTokenIsLoading: true,
      } as any);

      useRouterMock.mockReturnValue({
        replace: replaceFn,
      } as any);

      render(<OAuthCallbackHandler />);
      expect(screen.getByText(/Logging you in.../i)).toBeInTheDocument();

      expect(loginFn).toHaveBeenCalledTimes(1);
      expect(replaceFn).not.toHaveBeenCalled();
    });
  });

  describe('accessToken has loaded', () => {
    it('routes to the dashboard page', () => {
      const loginFn = jest.fn();
      const replaceFn = jest.fn();
      useAuthMock.mockReturnValue({
        login: loginFn,
        accessToken: 'accessTokenBlahBlah',
        accessTokenIsLoading: false,
      } as any);

      useRouterMock.mockReturnValue({
        replace: replaceFn,
      } as any);

      render(<OAuthCallbackHandler />);

      expect(replaceFn).toHaveBeenCalledTimes(1);
      expect(loginFn).not.toHaveBeenCalled;
    });
  });

  describe('accessToken has failed to load', () => {
    it('renders an error message', () => {
      const loginFn = jest.fn();
      const replaceFn = jest.fn();
      useAuthMock.mockReturnValue({
        login: loginFn,
        accessToken: undefined,
        accessTokenIsLoading: false,
      } as any);

      useRouterMock.mockReturnValue({
        replace: replaceFn,
      } as any);

      render(<OAuthCallbackHandler />);
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

      expect(replaceFn).not.toHaveBeenCalled();
      expect(loginFn).not.toHaveBeenCalled();
    });
  });
});
