/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import LoginHandler from './LoginHandler';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { mocked } from 'jest-mock';

const useAuthMock = mocked(useAuth, { shallow: true });
const useRouterMock = mocked(useRouter, { shallow: true });
const originalEnv = process.env;

jest.mock('@/hooks/useAuth');
jest.mock('next/navigation');

beforeEach(() => {
  jest.clearAllMocks();
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_API_URL: 'backendBaseUrl',
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('LoginHandler', () => {
  describe('when accessToken is absent', () => {
    it('renders a login button', () => {
      useAuthMock.mockReturnValue({
        accessToken: undefined,
      } as any);

      const replaceFn = jest.fn();
      useRouterMock.mockReturnValue({
        replace: replaceFn,
      } as any);

      render(<LoginHandler />);
      expect(screen.getByText(/Login/i)).toBeInTheDocument();
      expect(replaceFn).not.toHaveBeenCalled();
    });

    it('triggers a an oauth redirect when clicked', () => {
      const triggerDiscordOAuthFn = jest.fn();
      useAuthMock.mockReturnValue({
        accessToken: undefined,
        triggerDiscordOAuth: triggerDiscordOAuthFn,
      } as any);

      const replaceFn = jest.fn();
      useRouterMock.mockReturnValue({
        replace: replaceFn,
      } as any);

      render(<LoginHandler />);

      fireEvent.click(screen.getByText(/Login/i));
      expect(triggerDiscordOAuthFn).toHaveBeenCalled();
      expect(replaceFn).not.toHaveBeenCalled();
    });
  });

  describe('when accessToken is present', () => {
    it('redirects to the dashboard page', () => {
      useAuthMock.mockReturnValue({
        accessToken: 'someAccessTokenHere',
      } as any);

      const replaceFn = jest.fn();
      useRouterMock.mockReturnValue({
        replace: replaceFn,
      } as any);

      render(<LoginHandler />);

      expect(replaceFn).toHaveBeenCalledWith('/dashboard');
    });
  });
});
