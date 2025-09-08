import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AxiosError, HttpStatusCode } from 'axios';
import { captureException } from '@sentry/nextjs';
import {
  RateLimitError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from '@/types/errors';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof AxiosError;
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return isAxiosError(error) && error.status === HttpStatusCode.TooManyRequests;
}

export function isUnauthorizedError(
  error: unknown
): error is UnauthorizedError {
  return isAxiosError(error) && error.status === HttpStatusCode.Unauthorized;
}

export function isForbiddenError(error: unknown): error is ForbiddenError {
  return isAxiosError(error) && error.status === HttpStatusCode.Forbidden;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return isAxiosError(error) && error.status === HttpStatusCode.NotFound;
}

export function isBadRequestError(error: unknown): error is BadRequestError {
  return isAxiosError(error) && error.status === HttpStatusCode.BadRequest;
}

export function sendErrorToSentry(error: unknown): void {
  const isProdEnv = process.env.NODE_ENV === 'production';

  if (!isProdEnv || isForbiddenError(error)) return;

  captureException(error);
}
