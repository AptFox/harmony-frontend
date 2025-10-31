import { ScheduleContextProvider } from '@/contexts/ScheduleContext';
import { UserContextProvider } from '@/contexts/UserContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserContextProvider><ScheduleContextProvider>{children}</ScheduleContextProvider></UserContextProvider>;
}
