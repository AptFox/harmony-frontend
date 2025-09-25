import { AuthContextProvider } from '@/contexts';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
