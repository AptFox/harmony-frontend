'use client';
import { useUser, useAuth } from '@/contexts';
import { useToast } from '@/hooks/UseToast';
import { useEffect } from 'react';
import { isApiRateLimitError, isNoAccessTokenError } from '@/lib/utils';
import Image from 'next/image';

export default function DashboardHandler() {
  // TODO: split this file into components
  const { user, avatarUrl, isLoading, isError } = useUser();
  const { logout } = useAuth();
  const { toast, tooManyRequestsToast } = useToast();

  useEffect(() => {
    if (isLoading) return;
    if (isNoAccessTokenError(isError)) return;
    if (isError) {
      // TODO: add logic that inspects the error and prints a standard pretty message
      if (isApiRateLimitError(isError)) {
        tooManyRequestsToast();
        return;
      }
      toast({
        title: (isError as Error).name,
        description: (isError as Error).message,
        variant: 'destructive',
      });
    }
  }, [user, isLoading, isError, toast, tooManyRequestsToast]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex justify-center items-center lg:mb-0 lg:grid-cols-4 lg:text-center">
        {isLoading && (
          <div>
            <p>Dashboard loading...</p>
          </div>
        )}
        {user && (
          <div>
            <div>
              <p>Hello, {user.displayName}</p>
            </div>
            <div className="flex flex-col items-center">
              {avatarUrl && (
                <Image
                  src={avatarUrl}
                  alt={`${user.displayName}'s avatar`}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              )}
            </div>
            <div>
              <p>Details: {JSON.stringify(user)}</p>
            </div>
          </div>
        )}
        {isError && !isNoAccessTokenError(isError) && (
          <div>
            <p>Error loading user data</p>
          </div>
        )}
      </div>
      <div>
        <button onClick={logout}>Logout</button>
      </div>
    </main>
  );
}
