'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { useEffect } from 'react';
import LoginButton from '@/components/auth/LoginButton';

export default function LoginHandler() {
  const router = useRouter();
  const { accessToken, triggerBackendOAuth } = useAuth();

  useEffect(() => {
    if (accessToken) {
      router.replace('/dashboard');
    }
  }, [accessToken, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex justify-center items-center h-screen lg:mb-0 lg:grid-cols-4 lg:text-center">
        <LoginButton onClickFn={triggerBackendOAuth} />
      </div>
    </main>
  );
}
