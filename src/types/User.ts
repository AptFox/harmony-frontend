import { KeyedMutator } from 'swr';

export type User = {
  id: string;
  displayName: string;
  timeZoneId: number;
};

export type UserContextType = {
  user: User | undefined;
  isLoading: boolean;
  isError: Error | undefined;
  refreshUser: KeyedMutator<User>;
};
