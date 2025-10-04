import Link from 'next/link';
import { Button } from "@heroui/button"

export default function Home() {
  // TODO: split this file into components
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="flex justify-center items-center lg:mb-0 lg:grid-cols-4 lg:text-center">
        <p className="text-3xl text-center font-bold">Harmony root page</p>
      </div>
      <div className="flex items-center">
        <div className="flex justify-center items-center">
          <Button
            color="primary" variant="shadow"
            size="lg"
            as={Link}
            href="/login"
          >
            Go to Login Page
          </Button>
        </div>
      </div>
    </main>
  );
}
