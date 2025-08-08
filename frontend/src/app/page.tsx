'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { LoginForm } from '@/components/auth/LoginForm';
import { ChatInterfaceWrapper } from '@/components/chat/ChatInterfaceWrapper';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function Home() {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      {isLoading ? (
        <LoadingScreen />
      ) : !isAuthenticated ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <LoginForm />
        </div>
      ) : (
        <div className="min-h-screen">
          <ChatInterfaceWrapper />
        </div>
      )}
    </div>
  );
}