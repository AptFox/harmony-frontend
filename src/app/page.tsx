import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import icon from './icon.png'

export default function Home() {
  // TODO: split this file into components
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="flex justify-center items-center lg:text-center">
          <Image
            src={icon}
            alt="Harmony logo"
            width={128}
            height={128}
          />
      </div>
      <div className="flex items-center">
        <div className="flex justify-center items-center">
          <Link href="/login" className="no-underline">
            <Button color="primary" variant="default" size="lg">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
