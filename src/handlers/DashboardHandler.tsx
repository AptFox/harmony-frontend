'use client';
import { useUser, useAuth } from '@/hooks';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { isRateLimitError } from '@/lib/utils';
import Image from 'next/image';

export default function DashboardHandler() {
  // TODO: split this file into components
  const { user, avatarUrl, isLoading, isError } = useUser();
  const { clearAccessToken } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isLoading) return;
    if (isError) {
      // TODO: add logic that inspects the error and prints a standard pretty message
      if (isRateLimitError(isError)) {
        toast({
          title: 'Too Many Requests',
          description:
            "You are refreshing the page too often. If it didn't work the first few times, it probably won't work now.",
          variant: 'destructive',
        });
        return;
      } else {
        toast({
          title: isError.name,
          description: isError.message,
          variant: 'destructive',
        });
      }
    }
  }, [user, isLoading, isError, toast]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex justify-center items-center lg:mb-0 lg:grid-cols-4 lg:text-center">
        {isLoading && (
          <div>
            <p>Dashboard loading...</p>
          </div>
        )}
        {!isLoading && !isError && user && (
          <div>
            <div>
              <p>Hello, {user.displayName}</p>
            </div>
            <div>
              {avatarUrl && (
                <Image
                  src={avatarUrl}
                  alt={`${user.displayName}'s avatar`}
                  width={64}
                  height={64}
                  className="rounded-full center"
                />
              )}
              <p>Details: {JSON.stringify(user)}</p>
            </div>
          </div>
        )}
      </div>
      <div>
        <button onClick={clearAccessToken}>Logout</button>
      </div>
    </main>
  );
}
