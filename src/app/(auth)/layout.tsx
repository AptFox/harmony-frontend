'use client';
import {
  AuthContextProvider,
  ScheduleContextProvider,
  UserContextProvider,
  PlayerContextProvider,
} from '@/contexts';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthContextProvider>
      <UserContextProvider>
        <ScheduleContextProvider>
          <PlayerContextProvider>{children}</PlayerContextProvider>
        </ScheduleContextProvider>
      </UserContextProvider>
    </AuthContextProvider>
  );
}
