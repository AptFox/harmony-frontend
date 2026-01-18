import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import icon from './icon.png';

export default function Home() {
  // TODO: split this file into components
  return (
    <main className="flex flex-col items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center rounded-lg bg-secondary w-sm p-8 border">
        <div className="rounded-full border-3 border-primary-foreground">
          <Image src={icon} alt="Harmony logo" width={128} height={128} />
        </div>
        <h1 className="text-3xl font-bold">Harmony</h1>
        <p className="text-lg text-center text-muted-foreground max-w-xl">
          esports scheduling
        </p>
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
