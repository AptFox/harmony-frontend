import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  getErrorMessage,
  getRandomErrorSubtitle,
} from '@/lib/errors/errorUtils';
import HarmonyMascot from '@/components/branding/harmonyMascot';

export default function NotFound() {
  const message = getErrorMessage('404');
  const subtitle = getRandomErrorSubtitle();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="flex flex-col gap-1 items-center rounded-lg bg-secondary w-sm p-8 border">
        <HarmonyMascot />
        <h2 className="text-2xl text-center font-bold text-wrap">404</h2>
        <p className="text-lg text-center">{message}</p>
        <p className="text-center text-muted-foreground">{subtitle}</p>

        <div>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
