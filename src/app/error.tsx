'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  getErrorMessage,
  getRandomErrorSubtitle,
} from '@/lib/errors/errorUtils';
import { logError, sendErrorToSentry } from '@/lib/utils';
import Image from 'next/image';
import icon from '@/app/icon.png';
import { useRouter } from 'next/navigation';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const redirectToHomePage = () => {
    router.replace('/');
  };
  useEffect(() => {
    logError(error, 'Frontend Crash');
    sendErrorToSentry(error);
  }, [error]);

  const header = getErrorMessage('500');
  const subtitle = getRandomErrorSubtitle();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="flex flex-col gap-1 items-center rounded-lg bg-secondary w-sm p-8 border">
        <div className="rounded-full border-3 border-primary-foreground">
          <Image src={icon} alt="Harmony logo" width={128} height={128} />
        </div>
        <h2 className="text-lg text-center font-bold text-wrap">{header}</h2>
        <p className="text-center text-muted-foreground">{subtitle}</p>
        <div className="flex gap-2 mt-4">
          <Button variant="default" onClick={() => reset()}>
            Try again
          </Button>
          <Button variant="outline" onClick={redirectToHomePage}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
