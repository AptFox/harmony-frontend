import * as Sentry from '@sentry/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/themeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Harmony Schedlr',
  applicationName: 'Harmony',
  description: 'eSports Schedlr',
  other: {
    ...Sentry.getTraceData(),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="any" />
        <link
          rel="apple-touch-icon"
          href="/apple-icon.png"
          type="image/png"
          sizes="180x180"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen w-full bg-background">
            <main className="mx-auto max-w-350 p-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
