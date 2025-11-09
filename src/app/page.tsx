import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import icon from './icon.png';

export default function Home() {
  // TODO: split this file into components
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="flex flex-col items-center rounded-lg bg-secondary min-w-xs p-8">
        <div className="rounded-full border-3 border-primary">
          <Image src={icon} alt="Harmony logo" width={128} height={128} />
        </div>
        <h1 className="mt-4 mb-2 text-4xl font-bold">Harmony</h1>
        <p className="mb-8 text-lg text-center text-muted-foreground max-w-xl">
          esports scheduling
        </p>
        <div className="flex items-center">
          <div className="flex justify-center items-center">
            <Link href="/login" className="no-underline">
              <Button color="primary" variant="default" size="lg">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
