
'use client';
// This file is no longer used in the new architecture.
// It is kept to prevent breaking builds if other files still reference it by mistake.
// The new architecture initializes Firebase directly and uses a self-contained useUser hook.
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
