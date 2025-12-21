'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FindRidePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page with focus on search
    router.push('/#hero');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to search...</p>
    </div>
  );
}
