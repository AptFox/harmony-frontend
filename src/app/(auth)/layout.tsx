import { AuthContextProvider } from '@/context/AuthContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
