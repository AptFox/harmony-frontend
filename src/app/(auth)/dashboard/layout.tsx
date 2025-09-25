import { UserContextProvider } from '@/contexts/UserContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserContextProvider>{children}</UserContextProvider>;
}
