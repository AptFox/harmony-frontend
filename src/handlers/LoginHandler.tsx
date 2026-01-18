'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { useEffect } from 'react';
import LoginButton from '@/components/auth/LoginButton';
import Image from 'next/image';
import icon from '../app/icon.png';

export default function LoginHandler() {
  const router = useRouter();
  const { accessToken, triggerDiscordOAuth } = useAuth();

  useEffect(() => {
    if (accessToken) {
      router.replace('/dashboard');
    }
  }, [accessToken, router]);

  return (
    <main className="flex flex-col items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center rounded-lg bg-secondary w-sm p-8 border">
        <div className="rounded-full border-3 border-primary-foreground">
          <Image src={icon} alt="Harmony logo" width={128} height={128} />
        </div>
        <h1 className="text-3xl font-bold">Harmony</h1>
        <p className="text-lg text-center text-muted-foreground">
          esports scheduling
        </p>
        <div className="mt-4 flex items-center">
          <LoginButton onClickFn={triggerDiscordOAuth} />
        </div>
      </div>
    </main>
  );
}
