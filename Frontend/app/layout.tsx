'use client';

import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { LanguageProvider } from '@/contexts/language-context';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from '@/stores/auth-store';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}
        >
          <LanguageProvider>{children}</LanguageProvider>
        </GoogleOAuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
