import { AxiosError, HttpStatusCode } from 'axios';
import { captureException } from '@sentry/nextjs';
import {
  cn,
  isAxiosError,
  isApiRateLimitError,
  isClientRateLimitError,
  isNoAccessTokenError,
  isUnauthorizedError,
  isForbiddenError,
  isNotFoundError,
  isBadRequestError,
  isProdEnv,
  logWarn,
  logError,
  sendErrorToSentry,
} from './utils';
import {
  ApiRateLimitError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from '@/types/HarmonyErrorTypes';
import {
  ClientRateLimitError,
  NoAccessTokenError,
} from '@/lib/errors/HarmonyErrors';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

describe('utils', () => {
  const updateNodeEnv = (env: "development" | "production" | "test") => {
    process.env = { NODE_ENV: env }
  };

  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
      expect(cn('foo', false && 'bar', undefined, 'baz')).toBe('foo baz');
    });
  });

  describe('isAxiosError', () => {
    it('returns true for AxiosError', () => {
      const error = new AxiosError('fail');
      expect(isAxiosError(error)).toBe(true);
    });
    it('returns false for non-AxiosError', () => {
      expect(isAxiosError(new Error('fail'))).toBe(false);
      expect(isAxiosError({})).toBe(false);
    });
  });

  describe('isApiRateLimitError', () => {
    it('returns true for ApiRateLimitError', () => {
      const error = new AxiosError('fail') as ApiRateLimitError;
      error.status = HttpStatusCode.TooManyRequests;
      expect(isApiRateLimitError(error)).toBe(true);
    });
    it('returns false for other errors', () => {
      const error = new AxiosError('fail');
      error.status = HttpStatusCode.BadRequest;
      expect(isApiRateLimitError(error)).toBe(false);
      expect(isApiRateLimitError(new Error('fail'))).toBe(false);
    });
  });

  describe('isClientRateLimitError', () => {
    it('returns true for ClientRateLimitError', () => {
      const error = new ClientRateLimitError();
      expect(isClientRateLimitError(error)).toBe(true);
    });
    it('returns false for other errors', () => {
      expect(isClientRateLimitError(new Error('fail'))).toBe(false);
    });
  });

  describe('isNoAccessTokenError', () => {
    it('returns true for NoAccessTokenError', () => {
      const error = new NoAccessTokenError();
      expect(isNoAccessTokenError(error)).toBe(true);
    });
    it('returns false for other errors', () => {
      expect(isNoAccessTokenError(new Error('fail'))).toBe(false);
    });
  });

  describe('isUnauthorizedError', () => {
    it('returns true for UnauthorizedError', () => {
      const error = new AxiosError('fail') as UnauthorizedError;
      error.status = HttpStatusCode.Unauthorized;
      expect(isUnauthorizedError(error)).toBe(true);
    });
    it('returns false for other errors', () => {
      const error = new AxiosError('fail');
      error.status = HttpStatusCode.BadRequest;
      expect(isUnauthorizedError(error)).toBe(false);
    });
  });

  describe('isForbiddenError', () => {
    it('returns true for ForbiddenError', () => {
      const error = new AxiosError('fail') as ForbiddenError;
      error.status = HttpStatusCode.Forbidden;
      expect(isForbiddenError(error)).toBe(true);
    });
    it('returns false for other errors', () => {
      const error = new AxiosError('fail');
      error.status = HttpStatusCode.BadRequest;
      expect(isForbiddenError(error)).toBe(false);
    });
  });

  describe('isNotFoundError', () => {
    it('returns true for NotFoundError', () => {
      const error = new AxiosError('fail') as NotFoundError;
      error.status = HttpStatusCode.NotFound;
      expect(isNotFoundError(error)).toBe(true);
    });
    it('returns false for other errors', () => {
      const error = new AxiosError('fail');
      error.status = HttpStatusCode.BadRequest;
      expect(isNotFoundError(error)).toBe(false);
    });
  });

  describe('isBadRequestError', () => {
    it('returns true for BadRequestError', () => {
      const error = new AxiosError('fail') as BadRequestError;
      error.status = HttpStatusCode.BadRequest;
      expect(isBadRequestError(error)).toBe(true);
    });
    it('returns false for other errors', () => {
      const error = new AxiosError('fail');
      error.status = HttpStatusCode.NotFound;
      expect(isBadRequestError(error)).toBe(false);
    });
  });

  describe('isProdEnv', () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
    });
    afterAll(() => {
      process.env = OLD_ENV;
    });
    it('is true when NODE_ENV is production', () => {
      updateNodeEnv('production');
      expect(isProdEnv()).toBeTruthy();
    });
    it('is false when NODE_ENV is not production', () => {
      updateNodeEnv('development');
      expect(isProdEnv()).toBeFalsy();
    });
  });

  describe('logWarn', () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      process.env = { ...OLD_ENV };
    });
    afterEach(() => {
      (console.warn as jest.Mock).mockRestore();
      process.env = OLD_ENV;
    });
    it('calls console.warn in non-production', () => {
      updateNodeEnv('development');
      logWarn(new Error('test'), 'msg');
      expect(console.warn).toHaveBeenCalled();
    });
    it('does not call console.warn in production', () => {
      updateNodeEnv('production');
      logWarn(new Error('test'), 'msg');
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('logError', () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      process.env = { ...OLD_ENV };
    });
    afterEach(() => {
      (console.error as jest.Mock).mockRestore();
      process.env = OLD_ENV;
    });
    it('calls console.error in non-production', () => {
      updateNodeEnv('development');
      logError(new Error('test'), 'msg');
      expect(console.error).toHaveBeenCalled();
    });
    it('does not call console.error in production', () => {
      updateNodeEnv('production');
      logError(new Error('test'), 'msg');
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('sendErrorToSentry', () => {
    const OLD_ENV = process.env;
    
    afterAll(() => {
      process.env = OLD_ENV;
    });
    it('does not call captureException in non-production', () => {
      updateNodeEnv('development');
      sendErrorToSentry(new Error('fail'));
      expect(captureException).not.toHaveBeenCalled();
    });
    it('does not call captureException for forbidden error', () => {
      updateNodeEnv('production');
      const error = new AxiosError('fail');
      error.status = HttpStatusCode.Forbidden;
      sendErrorToSentry(error);
      expect(captureException).not.toHaveBeenCalled();
    });
    it('calls captureException in production for non-forbidden error', () => {
      updateNodeEnv('production');
      const error = new Error('fail');
      sendErrorToSentry(error);
      expect(captureException).toHaveBeenCalledWith(error);
    });
  });
});