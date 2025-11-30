export type User = {
  id: string;
  displayName: string;
  timeZoneId: string | null;
  discordId: string;
  discordAvatarHash: string | null;
  twelveHourClock: boolean;
};

export type UserContextType = {
  user: User | undefined;
  updateUser: (userToUpdate: User) => void;
  avatarUrl: string | null;
  isLoading: boolean;
  isError: Error | undefined;
};
