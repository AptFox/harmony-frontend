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
      <Image
        src={icon}
        alt="Harmony logo"
        width={128}
        height={128}
      />
      <div className="flex items-center">
        <LoginButton onClickFn={triggerDiscordOAuth} />
      </div>
    </main>
  );
}
