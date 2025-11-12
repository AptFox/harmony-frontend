'use client'
import { AuthContextProvider, ScheduleContextProvider, UserContextProvider } from '@/contexts';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return(
  <AuthContextProvider>
    <UserContextProvider>
      <ScheduleContextProvider>
        {children}
      </ScheduleContextProvider>
    </UserContextProvider>
  </AuthContextProvider>
  );
}
