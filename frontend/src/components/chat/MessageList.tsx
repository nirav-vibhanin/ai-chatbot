'use client';

import { motion } from 'framer-motion';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import { 
  Person as PersonIcon,
  SmartToy as BotIcon,
  Schedule as TimeIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  userId: string;
  message: string;
  sender: 'user' | 'bot';
  createdAt: string;
  updatedAt: string;
}

interface MessageListProps {
  message: Message;
}

export function MessageList({ message }: MessageListProps) {
  const isUser = message.sender === 'user';
  const isBot = message.sender === 'bot';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start space-x-3 max-w-4xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className={`flex-shrink-0 ${isUser ? 'order-2' : 'order-1'}`}
        >
          <Avatar
            className={`w-10 h-10 ${
              isUser 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                : 'bg-gradient-to-r from-green-400 to-blue-500'
            }`}
          >
            {isUser ? <PersonIcon /> : <BotIcon />}
          </Avatar>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={`flex-1 max-w-2xl ${isUser ? 'text-right' : 'text-left'}`}
        >
          <div
            className={`inline-block p-4 rounded-2xl shadow-lg ${
              isUser
                ? 'message-user text-white'
                : 'message-bot text-white'
            }`}
          >
            <div className="markdown-content">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow as any}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={`${isUser ? 'bg-white/20 text-white' : 'bg-gray-700 text-gray-200'} px-2 py-1 rounded text-sm`} {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className="mb-2 last:mb-0 text-white">{children}</p>,
                  h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-white">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-white">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-white">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-white">{children}</ol>,
                  li: ({ children }) => <li className="mb-1 text-white">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic mb-2 text-gray-200">
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }) => (
                    <a href={href} className="text-blue-300 hover:text-blue-200 underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {message.message}
              </ReactMarkdown>
            </div>

            <div className={`flex items-center mt-2 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
              <TimeIcon className={`w-3 h-3 mr-1 ${isUser ? 'text-white/80' : 'text-white/80'}`} />
              <span className={isUser ? 'text-white/80' : 'text-white/80'}>
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          <div className={`mt-1 text-xs ${isUser ? 'text-right' : 'text-left'}`}>
            <Chip
              label={isUser ? 'You' : 'AI Assistant'}
              size="small"
              className={`font-medium text-white shadow-md border-0 ${isUser ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'}`}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 