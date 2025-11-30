'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

export default function OAuthCallbackHandler() {
  const router = useRouter();
  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) router.replace('/dashboard');
  }, [accessToken, router]);

  return (
    <div>
      <div className="flex flex-col h-dvh w-dvw justify-center">
        <div className="flex flex-row justify-center">
          <div className="flex flex-row justify-center bg-secondary rounded-lg p-8 border">
            <span className="text-xl font-bold">Logging you in...</span>
            <Spinner className="ml-4 size-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
