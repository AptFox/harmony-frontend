/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import OAuthCallbackHandler from './OAuthCallbackHandler';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { mocked } from 'jest-mock';

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('@/contexts');
jest.mock('next/navigation');
const useAuthMock = mocked(useAuth, { shallow: true });
const useRouterMock = mocked(useRouter, { shallow: true });

describe('OAuthCallbackHandler', () => {
  describe('accessToken is loading', () => {
    it('renders a login spinner', () => {
      const replaceFn = jest.fn();
      useAuthMock.mockReturnValue({
        accessToken: 'someAccessToken',
      } as any);

      useRouterMock.mockReturnValue({
        replace: replaceFn,
      } as any);

      render(<OAuthCallbackHandler />);
      expect(screen.getByText(/Logging you in.../i)).toBeInTheDocument();
    });
  });

  describe('accessToken has loaded', () => {
    it('routes to the dashboard page', () => {
      useAuthMock.mockReturnValue({
        accessToken: 'accessTokenBlahBlah',
      } as any);

      const replaceFn = jest.fn();
      useRouterMock.mockReturnValue({
        replace: replaceFn,
      } as any);

      render(<OAuthCallbackHandler />);

      expect(replaceFn).toHaveBeenCalledWith('/dashboard');
    });
  });
});
