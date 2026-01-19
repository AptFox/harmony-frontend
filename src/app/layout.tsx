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
  icons: {
    icon: [{ url: '/bgIcon_2048.png', type: 'image/png', sizes: 'any' }],
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
