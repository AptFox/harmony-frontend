import { Button } from '@/components/ui/button';
import Link from 'next/link';
import HarmonyMascot from '@/components/branding/harmonyMascot';
import HarmonyHeader from '@/components/branding/harmonyHeader';
import HarmonySubHeader from '@/components/branding/harmonySubHeader';

export default function Home() {
  // TODO: split this file into components
  return (
    <main className="flex flex-col items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center rounded-lg bg-secondary w-sm p-8 border">
        <HarmonyMascot />
        <HarmonyHeader />
        <HarmonySubHeader />
        <div className="mt-4 flex items-center">
          <Link href="/login" className="no-underline">
            <Button variant="default">
              <span className="font-semibold text-lg">Try it now!</span>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
