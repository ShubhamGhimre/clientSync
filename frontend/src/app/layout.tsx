'use client';

import { useEffect } from 'react';
import { Inter, Dancing_Script } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { useAuthStore } from '@/store/auth-store';



const inter = Inter({ subsets: ['latin'] });
const script = Dancing_Script({
  subsets: ['latin'],
  weight: '600',
  variable: '--font-script',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth store on app start
    initialize();
  }, [initialize]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${script.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
