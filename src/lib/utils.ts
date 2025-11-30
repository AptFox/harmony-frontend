import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AxiosError, HttpStatusCode, CanceledError } from 'axios';
import { captureException } from '@sentry/nextjs';
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

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof AxiosError;
}

export function isScheduleError(error: unknown): error is AxiosError<{errors: string[]}> {
  return isAxiosError(error);
}

export function isCanceledError(
  error: unknown
): error is CanceledError<AxiosError> {
  return error instanceof CanceledError;
}

export function isApiRateLimitError(
  error: unknown
): error is ApiRateLimitError {
  return isAxiosError(error) && error.status === HttpStatusCode.TooManyRequests;
}

export function isClientRateLimitError(
  error: unknown
): error is ClientRateLimitError {
  return error instanceof ClientRateLimitError;
}

export function isNoAccessTokenError(
  error: unknown
): error is NoAccessTokenError {
  return error instanceof NoAccessTokenError;
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

export const isProdEnv = () => process.env.NODE_ENV === 'production';

export function logInfo(message: string): void {
  if (!isProdEnv()) console.info(message);
}

export function logWarn(error: Error | unknown, message: string): void {
  if (!isProdEnv()) console.warn(error, message);
}

export function logError(error: Error | unknown, message: string): void {
  if (!isProdEnv()) console.error(error, message);
}

export function sendErrorToSentry(error: unknown): void {
  if (!isProdEnv()) return;
  if (isForbiddenError(error)) return;

  captureException(error);
}
