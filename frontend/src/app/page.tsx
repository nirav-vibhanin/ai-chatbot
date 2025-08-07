'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { LoginForm } from '@/components/auth/LoginForm';
import { ChatInterfaceWrapper } from '@/components/chat/ChatInterfaceWrapper';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { HydrationSafeWrapper } from '@/components/ui/HydrationSafeWrapper';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  return (
    <HydrationSafeWrapper fallback={<LoadingScreen />} suppressHydrationWarning>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <AnimatePresence mode="wait">
            {!isAuthenticated ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="min-h-screen flex items-center justify-center p-4"
              >
                <LoginForm />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="min-h-screen"
              >
                <ChatInterfaceWrapper />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </HydrationSafeWrapper>
  );
} 