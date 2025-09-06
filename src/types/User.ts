export type User = {
  id: string;
  displayName: string;
  timeZoneId: number;
  discordId: string;
  discordAvatarHash: string | null;
};

export type UserContextType = {
  user: User | undefined;
  avatarUrl: string | null;
  isLoading: boolean;
  isError: Error | undefined;
};
