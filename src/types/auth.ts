export type AuthContextType = {
  accessToken: string | undefined;
  setAccessToken: (accessToken: string | undefined) => void;
  logout: () => void;
  triggerDiscordOAuth: () => void;
};
