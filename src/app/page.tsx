import Link from "next/link";

export default function Home() {
  return (
  <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <div className="flex space-x-24 items-center">
      <div className="flex justify-center items-center lg:mb-0 lg:grid-cols-4 lg:text-center">
        <Link href="/dashboard">
          <p className="text-xl text-center">Dashboard</p>
        </Link>
      </div>
      <div className="flex justify-center items-center lg:mb-0 lg:grid-cols-4 lg:text-center">
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
