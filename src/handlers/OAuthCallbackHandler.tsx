'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function OAuthCallbackHandler() {
  const router = useRouter();
  const { getAccessToken, accessToken, accessTokenIsLoading } = useAuth();

  useEffect(() => {
    if (!accessToken && accessTokenIsLoading) {
      getAccessToken();
    }
    if (accessToken && !accessTokenIsLoading) {
      router.replace('/dashboard');
    }
  }, [accessToken, accessTokenIsLoading, getAccessToken, router]);

  return (
    <div>
      {!accessToken && accessTokenIsLoading && <p>Logging you in...</p>}
      {!accessToken && !accessTokenIsLoading && <p>Something went wrong</p>}
    </div>
  );
}
