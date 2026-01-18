'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  getErrorMessage,
  getRandomErrorSubtitle,
} from '@/lib/errors/errorUtils';
import { Skeleton } from '@/components/ui/skeleton';
import HarmonyMascot from '@/components/branding/harmonyMascot';

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('statusCode') || undefined;
  const [errorHeader, setErrorHeader] = useState<string | undefined>();
  const [subtitle, setSubtitle] = useState<string | undefined>();

  useEffect(() => {
    setErrorHeader(getErrorMessage(errorCode));
    setSubtitle(getRandomErrorSubtitle());
  }, [errorCode]);

  return (
    <>
      <h2 className="text-2xl text-center font-bold text-wrap">{errorCode}</h2>
      <h2 className="text-lg text-center font-bold text-wrap">{errorHeader}</h2>
      <p className="text-center text-muted-foreground">{subtitle}</p>
    </>
  );
}

function ErrorSkeleton() {
  return (
    <>
      <Skeleton className="h-10 w-[100px]" />
      <Skeleton className="h-6 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </>
  );
}

export default function ErrorHandler() {
  const router = useRouter();
  const redirectToHomePage = () => {
    router.replace('/');
  };

  return (
    <main className="flex flex-col items-center p-24">
      <div className="flex flex-col gap-2 items-center rounded-lg bg-secondary w-sm p-8 border">
        <HarmonyMascot />
        <Suspense fallback={<ErrorSkeleton />}>
          <ErrorContent />
        </Suspense>
        <div className="flex items-center">
          <Button onClick={redirectToHomePage}>Go Home</Button>
        </div>
      </div>
    </main>
  );
}
