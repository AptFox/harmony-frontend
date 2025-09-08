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

  describe('accessToken has failed to load', () => {
    it('renders an error message', () => {
      const replaceFn = jest.fn();
      useAuthMock.mockReturnValue({
        accessToken: undefined,
      } as any);

      useRouterMock.mockReturnValue({
        replace: replaceFn,
      } as any);

      render(<OAuthCallbackHandler />);
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

      expect(replaceFn).not.toHaveBeenCalled();
    });
  });
});
