export type AuthContextType = {
  accessToken: string | undefined;
  setAccessToken: (accessToken: string | undefined) => void;
  accessTokenIsLoading: boolean;
  setAccessTokenIsLoading: (isLoading: boolean) => void;
  getAccessToken: () => void;
  clearAccessToken: () => void;
  triggerBackendOAuth: () => void;
};
