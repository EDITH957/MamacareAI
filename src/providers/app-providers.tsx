'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { initializeDatabase } from '@/lib/services/database';

export function AppProviders({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDatabase()
      .then(() => setReady(true))
      .catch((err) => setError(err instanceof Error ? err.message : 'Database initialization failed'));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-red-50 p-4 dark:bg-red-950">
        <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 text-center dark:border-red-800 dark:bg-red-900">
          <p className="mb-2 text-lg font-semibold text-red-700 dark:text-red-200">Initialization Error</p>
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-600 border-t-transparent" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Initializing MamaCare AI...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
    </>
  );
}
