export type ErrorCode =
  | '400'
  | '401'
  | '403'
  | '404'
  | '500'
  | '503'
  | 'default';

export class ClientRateLimitError extends Error {
  constructor() {
    super('Client-side auth rate limit exceeded');
    this.name = 'ClientRateLimitError';
  }
}

export class NoAccessTokenError extends Error {
  constructor() {
    super('No access token supplied');
    this.name = 'NoAccessTokenError';
  }
}
