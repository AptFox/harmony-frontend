import { Button } from '@/components/ui/button';
import Link from 'next/link'

export default function Home() {
  // TODO: split this file into components
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="flex justify-center items-center lg:mb-0 lg:grid-cols-4 lg:text-center">
        <p className="text-3xl text-center font-bold">Harmony root page</p>
      </div>
      <div className="flex items-center">
        <div className="flex justify-center items-center">
          <Link href="/login" className="no-underline">
            <Button
              color="primary" variant="default"
              size="lg"
            >
              Go to Login Page
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
