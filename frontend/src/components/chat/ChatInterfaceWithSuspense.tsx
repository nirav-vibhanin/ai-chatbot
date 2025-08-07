'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const ChatInterface = dynamic(() => import('./ChatInterface').then(mod => ({ default: mod.ChatInterface })), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export function ChatInterfaceWithSuspense() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ChatInterface />
    </Suspense>
  );
} 