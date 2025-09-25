import { authRateLimitExceeded, AUTH_RATE_LIMIT_KEY, RATE_LIMIT, RATE_LIMIT_TIMEOUT } from './RateLimiter';

describe('authRateLimitExceeded', () => {
  let mockNow = 0;

  beforeEach(() => {
    mockNow = 1000000;
    global.Date.now = jest.fn(() => mockNow);
    global.localStorage.clear();
  });

  afterEach(() => {
    global.Date.now = Date.now;
    global.localStorage.clear();
  });

  it('should allow requests under the rate limit', () => {
    for (let i = 0; i < 10; i++) {
      expect(authRateLimitExceeded()).toBe(false);
    }
  });

  it('should block requests after exceeding the rate limit', () => {
    for (let i = 0; i < 10; i++) {
      expect(authRateLimitExceeded()).toBe(false);
    }
    expect(authRateLimitExceeded()).toBe(true);
  });

  it('should reset the rate limit window after timeout', () => {
    for (let i = 0; i < 10; i++) {
      expect(authRateLimitExceeded()).toBe(false);
    }
    expect(authRateLimitExceeded()).toBe(true);

    // Advance time by more than one minute
    mockNow += RATE_LIMIT_TIMEOUT + 1;
    expect(authRateLimitExceeded()).toBe(false);
  });

  it('should initialize rate limit data if localStorage is empty', () => {
    expect(authRateLimitExceeded()).toBe(false);
    const data = JSON.parse(localStorage.getItem(AUTH_RATE_LIMIT_KEY) || '{}');
    
    expect(data.requestCount).toBe(1);
    expect(data.windowStart).toBe(mockNow);
  });

  it('should not increment requestCount if rate limit is exceeded', () => {
    for (let i = 0; i < 10; i++) {
      expect(authRateLimitExceeded()).toBe(false);
    }
    expect(authRateLimitExceeded()).toBe(true);

    // requestCount should not increase after limit is exceeded
    const data = JSON.parse(localStorage.getItem(AUTH_RATE_LIMIT_KEY) || '{}');
    expect(data.requestCount).toBe(RATE_LIMIT);
  });
});
