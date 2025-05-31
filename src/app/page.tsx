
"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import Logo from '@/components/Logo';

export default function HomePage() {
  const router = useRouter();
  const { user, authLoading } = useAppContext();

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, authLoading, router]);

  // Display a loading state while checking auth status
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="mb-8">
         <Logo size="lg" />
        </div>
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-8 w-64" />
        <p className="mt-4 text-muted-foreground">Loading BudgetWise...</p>
      </div>
    );
  }

  // This content will briefly show before redirection or if redirection fails
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
