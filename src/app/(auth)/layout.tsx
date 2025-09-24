import { AuthContextProvider } from '@/context';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
