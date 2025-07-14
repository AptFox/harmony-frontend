export type AuthContextType = {
  accessToken: string | undefined;
  accessTokenIsLoading: boolean;
  setAccessToken: (accessToken: string | undefined) => void;
  login: () => void;
  logout: () => void;
};
