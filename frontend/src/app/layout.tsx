'use client';

import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { useAuthStore } from '@/store/auth-store';



const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
