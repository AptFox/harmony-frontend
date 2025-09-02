import { UserContextProvider } from '@/context/UserContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserContextProvider>{children}</UserContextProvider>;
}
