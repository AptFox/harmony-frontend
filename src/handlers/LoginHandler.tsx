'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { useEffect } from 'react';
import LoginButton from '@/components/auth/LoginButton';
import HarmonyMascot from '@/components/branding/harmonyMascot';
import HarmonyHeader from '@/components/branding/harmonyHeader';
import HarmonySubHeader from '@/components/branding/harmonySubHeader';

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
        <HarmonyMascot />
        <HarmonyHeader />
        <HarmonySubHeader />
        <div className="mt-4 flex items-center">
          <LoginButton onClickFn={triggerDiscordOAuth} />
        </div>
      </div>
    </main>
  );
}
