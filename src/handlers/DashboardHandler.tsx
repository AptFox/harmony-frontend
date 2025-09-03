'use client';
import { useUser, useAuth } from '@/hooks';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardHandler() {
  // TODO: split this file into components
  const { user, isLoading, isError } = useUser();
  const { logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isLoading) return;
    if (isError) {
      // TODO: add logic that inspects the error and prints a standard pretty message
      toast({
        title: isError.name,
        description: isError.message,
        variant: 'destructive',
      });

      router.push('/login');
    }
  }, [user, isLoading, isError, toast, router]);

  function logoutFn() {
    logout();
    router.replace('/login');
  }

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
              <p>Details: {JSON.stringify(user)}</p>
            </div>
          </div>
        )}
      </div>
      <div>
        <button onClick={logoutFn}>Logout</button>
      </div>
    </main>
  );
}
