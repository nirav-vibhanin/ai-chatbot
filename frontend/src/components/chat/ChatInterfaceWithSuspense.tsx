'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const ChatInterface = dynamic(() => import('./ChatInterface').then(mod => ({ default: mod.ChatInterface })), {
  ssr: false,
  loading: () => <LoadingScreen />
});

export function ChatInterfaceWithSuspense() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ChatInterface />
    </Suspense>
  );
} 