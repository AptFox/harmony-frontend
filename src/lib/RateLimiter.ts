export const RATE_LIMIT_TIMEOUT = 60000; // one minute in milliseconds
export const RATE_LIMIT = 10;
export const AUTH_RATE_LIMIT_KEY = 'authRequests';

type RateLimitData = {
  requestCount: number;
  windowStart: number;
};

function getRateLimitData(currentTime: number): RateLimitData {
  const rateLimiteDataFromLocalStorage =
    localStorage.getItem(AUTH_RATE_LIMIT_KEY);
  return rateLimiteDataFromLocalStorage
    ? JSON.parse(rateLimiteDataFromLocalStorage)
    : { requestCount: 0, windowStart: currentTime };
}

function setRateLimitData(rateLimitData: RateLimitData) {
  localStorage.setItem(AUTH_RATE_LIMIT_KEY, JSON.stringify(rateLimitData));
}

export function authRateLimitExceeded(): boolean {
  const currentTime = Date.now();
  const rateLimitData: RateLimitData = getRateLimitData(currentTime);

  const rateLimitWindowExpired =
    currentTime - rateLimitData.windowStart > RATE_LIMIT_TIMEOUT;
  if (rateLimitWindowExpired) {
    // if rate limit has expired, reset rateLimitData
    rateLimitData.windowStart = currentTime;
    rateLimitData.requestCount = 0;
  }

  const rateLimitExceeded = rateLimitData.requestCount >= RATE_LIMIT;
  if (!rateLimitExceeded) {
    // if rate limit is not exceeded, update rateLimitData
    rateLimitData.requestCount += 1;
    setRateLimitData(rateLimitData);
  }

  return rateLimitExceeded;
}
