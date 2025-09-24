import { AxiosError, HttpStatusCode } from 'axios';

export type ApiRateLimitError = AxiosError & {
  status: HttpStatusCode.TooManyRequests;
};
export type UnauthorizedError = AxiosError & {
  status: HttpStatusCode.Unauthorized;
};
export type ForbiddenError = AxiosError & { status: HttpStatusCode.Forbidden };
export type NotFoundError = AxiosError & { status: HttpStatusCode.NotFound };
export type BadRequestError = AxiosError & {
  status: HttpStatusCode.BadRequest;
};
