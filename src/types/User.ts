export type User = {
  id: string;
  displayName: string;
  timeZoneId: number;
};

export type UserContextType = {
  user: User | undefined;
  isLoading: boolean;
  isError: Error | undefined;
};
