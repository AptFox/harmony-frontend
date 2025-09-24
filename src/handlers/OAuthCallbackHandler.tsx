'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context';
import { useRouter } from 'next/navigation';

export default function OAuthCallbackHandler() {
  const router = useRouter();
  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) router.replace('/dashboard');
  }, [accessToken, router]);

  return (
    <div>
      {accessToken && <p>Logging you in...</p>}
      {!accessToken && <p>Something went wrong</p>}
    </div>
  );
}
