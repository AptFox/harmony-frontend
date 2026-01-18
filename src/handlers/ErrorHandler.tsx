'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import icon from '@/app/icon.png';
import { Button } from '@/components/ui/button';
import {
  getErrorMessage,
  getRandomErrorSubtitle,
} from '@/lib/errors/errorUtils';

export default function LoginHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('statusCode') || undefined;
  const [errorHeader, setErrorHeader] = useState<string | undefined>();
  const [subtitle, setSubtitle] = useState<string | undefined>();

  useEffect(() => {
    setErrorHeader(getErrorMessage(errorCode));
    setSubtitle(getRandomErrorSubtitle());
  }, [errorCode]);

  const redirectToHomePage = () => {
    router.replace('/');
  };

  return (
    <main className="flex flex-col items-center p-24">
      <div className="flex flex-col gap-2 items-center rounded-lg bg-secondary w-sm p-8 border">
        <div className="rounded-full border-3 border-primary-foreground">
          <Image src={icon} alt="Harmony logo" width={128} height={128} />
        </div>
        <h2 className="text-2xl text-center font-bold text-wrap">
          {errorCode}
        </h2>
        <h2 className="text-lg text-center font-bold text-wrap">
          {errorHeader}
        </h2>
        <p className="text-center text-muted-foreground">{subtitle}</p>
        <div className="flex items-center">
          <Button onClick={redirectToHomePage}>Go Home</Button>
        </div>
      </div>
    </main>
  );
}
