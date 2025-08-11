'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconButton,
  Chip,
  Fade,
  Skeleton
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon
} from '@mui/icons-material';
import { RootState, AppDispatch } from '@/store/store';
import { setMessages, clearMessages, addMessage, resetLoading } from '@/store/slices/chatSlice';
import { useChatHistoryQuery } from '@/services/chatApi';
import { clearAuth } from '@/store/slices/authSlice';
import { useSocket } from '@/hooks/useSocket';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { Sidebar } from './Sidebar';



export function ChatInterface() {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, isLoading, error, isStreaming, currentStreamingMessage } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const { isConnected, isConnecting, isReconnecting, isInitializing, connectionError, reconnect, sendMessage: sendSocketMessage } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth: boolean) => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  const { data: history, isLoading: isHistoryLoading, isFetching: isHistoryFetching } = useChatHistoryQuery();
  useEffect(() => {
    if (history) {
      dispatch(setMessages(history));
      // Ensure we jump to the latest message after history loads
      setTimeout(() => scrollToBottom(false), 0);
    }
  }, [history, dispatch, scrollToBottom]);

  useEffect(() => {
    // Smoothly follow new messages/streaming
    if (!isHistoryLoading && !isHistoryFetching) {
      scrollToBottom(true);
    }
  }, [messages, currentStreamingMessage, isHistoryLoading, isHistoryFetching, scrollToBottom]);

  useEffect(() => {
    return () => {
      dispatch(resetLoading());
    };
  }, [dispatch]);

  const handleSendMessage = async (message: string) => {
    if (message.trim() && user) {
      const userMessage = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        message: message.trim(),
        sender: 'user' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      dispatch(addMessage(userMessage));
      
      const sent = sendSocketMessage(message.trim());
      if (!sent) {
      }
    }
  };

  const handleClearMessages = () => {
    dispatch(clearMessages());
  };

  const handleLogout = () => {
    dispatch(clearAuth());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen flex overflow-hidden"
    >
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-80 bg-white/10 backdrop-blur-md border-r border-white/20 hidden lg:block fixed left-0 top-0 h-screen z-10 overflow-y-auto sidebar-scrollbar"
      >
        <Sidebar 
          messageCount={messages?.length || 0}
          onClearMessages={handleClearMessages}
          onLogout={handleLogout}
        />
      </motion.div>

      <div className="flex-1 flex flex-col lg:ml-80 h-screen">
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex-shrink-0 z-20"
        >
          <ChatHeader 
            isConnected={isConnected}
            onLogout={handleLogout}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex-1 overflow-hidden relative"
        >
          <div className="h-full flex flex-col">
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 chat-scrollbar">
              {isHistoryLoading || isHistoryFetching ? (
                <div className="flex flex-col space-y-4">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="flex items-start space-x-3 max-w-4xl">
                      <Skeleton variant="circular" width={40} height={40} />
                      <div className="flex-1 max-w-2xl">
                        <Skeleton variant="rounded" height={24} className="mb-2" />
                        <Skeleton variant="rounded" height={24} width="80%" />
                      </div>
                    </div>
                  ))}
                </div>
               ) : messages && messages.length > 0 ? (
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.1,
                        ease: 'easeOut' 
                      }}
                    >
                      <MessageList message={message} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-gray-500">No messages yet. Start a conversation!</div>
                </div>
              )}

              {isStreaming && currentStreamingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-start mb-4">
                    <div className="flex items-start space-x-3 max-w-4xl">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <WifiIcon className="text-white text-xl" />
                        </div>
                      </div>
                      <div className="flex-1 max-w-2xl">
                                                 <div className="message-streaming inline-block p-4 rounded-2xl rounded-bl-md shadow-lg">
                           <div className="markdown-content">
                            <p className="mb-2">{currentStreamingMessage}</p>
                            <div className="typing-indicator">
                              <div className="typing-dot"></div>
                              <div className="typing-dot"></div>
                              <div className="typing-dot"></div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-1 text-xs opacity-60">
                          <Chip
                            label="AI Assistant"
                            size="small"
                            className="bg-green-100 text-green-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <Fade in={(!isConnected && !isInitializing) || isConnecting || isReconnecting}>
              <div className="px-4 pb-2 flex items-center space-x-2">
                {isInitializing ? (
                  <Chip
                    icon={<WifiIcon />}
                    label="Initializing..."
                    color="info"
                    size="small"
                    className="bg-blue-100 text-blue-800"
                  />
                ) : isConnecting ? (
                  <Chip
                    icon={<WifiIcon />}
                    label="Connecting..."
                    color="warning"
                    size="small"
                    className="bg-yellow-100 text-yellow-800"
                  />
                ) : isReconnecting ? (
                  <Chip
                    icon={<WifiIcon />}
                    label="Reconnecting..."
                    color="warning"
                    size="small"
                    className="bg-yellow-100 text-yellow-800"
                  />
                ) : !isConnected ? (
                  <>
                    <Chip
                      icon={<WifiOffIcon />}
                      label={connectionError?.includes('Session expired') ? 'Session expired' : connectionError || "Disconnected"}
                      color="error"
                      size="small"
                      className="bg-red-100 text-red-800"
                    />
                    {!connectionError?.includes('Session expired') && (
                      <IconButton
                        onClick={reconnect}
                        size="small"
                        className="text-red-600 hover:text-red-800"
                        title="Reconnect"
                      >
                        <RefreshIcon />
                      </IconButton>
                    )}
                  </>
                ) : null}
              </div>
            </Fade>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-2"
              >
                <Chip
                  label={error}
                  color="error"
                  size="small"
                  className="bg-red-100 text-red-800"
                />
              </motion.div>
            )}
          </div>
        </motion.div>
              
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          className="flex-shrink-0 p-4 border-t border-white/20 bg-white/5 backdrop-blur-sm"
        >
          <MessageInput 
            onSendMessage={handleSendMessage}
            disabled={!isConnected || isLoading || isStreaming}
            isSending={isLoading || isStreaming}
            placeholder={!isConnected ? (isInitializing ? "Initializing..." : connectionError?.includes('Session expired') ? "Session expired. Please log in again." : isReconnecting ? "Reconnecting..." : "Connecting to server...") : "Type your message..."}
          />
        </motion.div>
      </div>
    </motion.div>
  );
} 