import * as Sentry from '@sentry/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/themeProvider';

const inter = Inter({ subsets: ['latin'] });

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://harmony-schedlr.com';
const harmonyDesc = 'eSports Schedlr';

export const metadata: Metadata = {
  title: 'Harmony Schedlr',
  applicationName: 'Harmony',
  description: harmonyDesc,
  openGraph: {
    title: 'Harmony',
    description: harmonyDesc,
    url: `${baseUrl}`,
    siteName: 'Harmony',
    images: [
      {
        url: `${baseUrl}/icon_bg_1000.png`,
        width: 1000,
        height: 1000,
        alt: 'Harmony Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Harmony',
    description: harmonyDesc,
    images: [`${baseUrl}/icon_bg_1000.png`],
  },
  icons: {
    icon: [{ url: '/icon_bg_1000.png', type: 'image/png', sizes: 'any' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
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
