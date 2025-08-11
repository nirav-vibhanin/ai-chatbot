'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const ChatInterface = dynamic(() => import('./ChatInterface').then(mod => ({ default: mod.ChatInterface })), {
  ssr: false,
  loading: () => <LoadingScreen />
});

export function ChatInterfaceWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingScreen />;
  }

  return <ChatInterface />;
} 