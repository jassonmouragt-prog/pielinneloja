import React, { useEffect, useState } from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Ensures that the children are only rendered on the client-side.
 * Useful for components that depend on browser APIs (like Recharts, window, localStorage).
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
