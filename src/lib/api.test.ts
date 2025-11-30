import {
  swrFetcher,
  getAccessTokenFromApi,
  logoutOfApi,
  apiPut,
} from '@/lib/api';
import { authRateLimitExceeded } from '@/lib/RateLimiter';
import { mocked } from 'jest-mock';
import {
  ClientRateLimitError,
  NoAccessTokenError,
} from './errors/HarmonyErrors';
import { post, get, put } from '@/lib/apiClient';

jest.mock('@/lib/RateLimiter');
jest.mock('@/lib/apiClient');

const mockApiClientPost = mocked(post, { shallow: true });
const mockApiClientGet = mocked(get, { shallow: true });
const mockApiClientPut = mocked(put, { shallow: true });

const mockAuthRateLimitExceeded = mocked(authRateLimitExceeded, {
  shallow: true,
});

describe('api', () => {
  describe('getAccessTokenFromApi', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('throws if rate limit exceeded', async () => {
      mockAuthRateLimitExceeded.mockReturnValue(true);
      try {
        await getAccessTokenFromApi();
      } catch (e) {
        expect(e).toBeInstanceOf(ClientRateLimitError);
      }
      expect(mockAuthRateLimitExceeded).toHaveBeenCalledTimes(1);
    });

    it('returns access token on success', async () => {
      mockAuthRateLimitExceeded.mockReturnValue(false);

      mockApiClientPost.mockResolvedValue({
        data: { harmony_access_token: 'token-abc' },
      });

      const token = await getAccessTokenFromApi();
      expect(token).toBe('token-abc');
      expect(mockAuthRateLimitExceeded).toHaveBeenCalledTimes(1);
      expect(mockApiClientPost).toHaveBeenCalledWith(
        '/auth/refresh_token',
        null,
        {
          withCredentials: true,
        }
      );
    });
  });

  describe('logoutOfApi', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('calls logout endpoint', async () => {
      mockApiClientPost.mockResolvedValue({ data: {} });

      await logoutOfApi();
      expect(mockApiClientPost).toHaveBeenCalledWith('/auth/logout', null, {
        withCredentials: true,
      });
    });
  });

  describe('apiPut', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('throws if no access token provided', async () => {
      try {
        await apiPut('/some-endpoint', undefined, { foo: 'bar' });
      } catch (e) {
        expect(e).toBeInstanceOf(NoAccessTokenError);
      }
      expect(mockApiClientPut).not.toHaveBeenCalled();
    });

    it('sends PUT request when called with accessToken', async () => {
      mockApiClientPut.mockResolvedValue({ data: { foo: 'bar' } });

      const result = await apiPut('/some-endpoint', 'token-abc', {
        foo: 'bar',
      });
      expect(result).toEqual({ foo: 'bar' });
      expect(mockApiClientPut).toHaveBeenCalledWith(
        '/some-endpoint',
        { foo: 'bar' },
        {
          headers: { Authorization: 'Bearer token-abc' },
        }
      );
    });
  });

  describe('swrFetcher', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('throws if no access token provided', async () => {
      try {
        await swrFetcher<{ foo: string }>('/some-endpoint', undefined);
      } catch (e) {
        expect(e).toBeInstanceOf(NoAccessTokenError);
      }
      expect(mockApiClientGet).not.toHaveBeenCalled();
    });

    it('sends GET request when called with accessToken', async () => {
      mockApiClientGet.mockResolvedValue({ data: { foo: 'bar' } });

      const result = await swrFetcher<{ foo: string }>(
        '/some-endpoint',
        'token-abc'
      );
      expect(result).toEqual({ foo: 'bar' });
      expect(mockApiClientGet).toHaveBeenCalledWith('/some-endpoint', {
        headers: { Authorization: 'Bearer token-abc' },
      });
    });
  });
});
