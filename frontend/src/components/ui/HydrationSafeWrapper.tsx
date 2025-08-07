'use client';

import { useState, useEffect } from 'react';

interface HydrationSafeWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  suppressHydrationWarning?: boolean;
}

export function HydrationSafeWrapper({ 
  children, 
  fallback = null, 
  suppressHydrationWarning = false 
}: HydrationSafeWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  if (suppressHydrationWarning) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return <>{children}</>;
} 