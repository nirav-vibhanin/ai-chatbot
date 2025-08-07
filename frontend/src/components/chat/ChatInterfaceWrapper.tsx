'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const ChatInterface = dynamic(() => import('./ChatInterface').then(mod => ({ default: mod.ChatInterface })), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export function ChatInterfaceWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingSpinner />;
  }

  return <ChatInterface />;
} 