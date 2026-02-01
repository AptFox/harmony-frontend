export type AuthContextType = {
  accessToken: string | undefined;
  setAccessToken: (accessToken: string | undefined) => void;
  isLoading: boolean;
  logout: () => void;
  handleAuthError: (error: unknown) => void;
  triggerDiscordOAuth: () => void;
};
