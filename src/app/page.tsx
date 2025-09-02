import Link from 'next/link';

export default function Home() {
  // TODO: split this file into components
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="flex items-center">
        <div className="flex justify-center items-center">
          <Link href="/login">
            <p className="text-xl text-center">Login</p>
          </Link>
        </div>
      </div>
      <div className="flex justify-center items-center lg:mb-0 lg:grid-cols-4 lg:text-center">
        <p className="text-3xl text-center font-bold">Harmony root page</p>
      </div>
    </main>
  );
}
