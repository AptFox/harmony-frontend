'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { useEffect } from 'react';
import LoginButton from '@/components/auth/LoginButton';
import Image from 'next/image';
import icon from '../app/icon.png'

export default function LoginHandler() {
  const router = useRouter();
  const { accessToken, triggerDiscordOAuth } = useAuth();

  useEffect(() => {
    if (accessToken) {
      router.replace('/dashboard');
    }
  }, [accessToken, router]);

  return (
    <main className="flex flex-col items-center p-24">
      <div className="flex flex-col items-center rounded-lg bg-secondary min-w-xs p-8">
        <div className="rounded-full border-3 border-primary">
          <Image
            src={icon}
            alt="Harmony logo"
            width={128}
            height={128}
          />
        </div>
        <h1 className="mt-4 mb-2 text-4xl font-bold">Harmony</h1>
        <p className="mb-8 text-lg text-center text-muted-foreground max-w-xl">
          esports scheduling
        </p>
        <div className="flex items-center">
          <LoginButton onClickFn={triggerDiscordOAuth} />
        </div>
      </div>
    </main>
  );
}
