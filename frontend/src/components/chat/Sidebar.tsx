'use client';

import { motion } from 'framer-motion';
import { 
  Typography, 
  Button, 
  Divider,
  Chip,
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  Logout as LogoutIcon,
  Chat as ChatIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';

interface SidebarProps {
  messageCount: number;
  onClearMessages: () => void;
  onLogout: () => void;
}

export function Sidebar({ messageCount, onClearMessages, onLogout }: SidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="h-full flex flex-col p-6 min-h-screen"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
          >
            <BotIcon className="text-white text-2xl" />
          </motion.div>
          <div>
            <Typography variant="h6" className="gradient-text font-bold">
              AI Chatbot
            </Typography>
            <Typography variant="caption" className="text-gray-300">
              Chat Assistant
            </Typography>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-6"
      >
        <Typography variant="h6" className="text-white font-semibold mb-3">
          Chat Statistics
        </Typography>
        
        <div className="space-y-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ChatIcon className="text-blue-400" />
                <Typography variant="body2" className="text-gray-300">
                  Total Messages
                </Typography>
              </div>
              <Chip 
                label={messageCount} 
                size="small" 
                className="bg-blue-100 text-blue-800 font-semibold"
              />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PersonIcon className="text-green-400" />
                <Typography variant="body2" className="text-gray-300">
                  User Messages
                </Typography>
              </div>
              <Chip 
                label={Math.ceil(messageCount / 2)} 
                size="small" 
                className="bg-green-100 text-green-800 font-semibold"
              />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BotIcon className="text-purple-400" />
                <Typography variant="body2" className="text-gray-300">
                  AI Responses
                </Typography>
              </div>
              <Chip 
                label={Math.floor(messageCount / 2)} 
                size="small" 
                className="bg-purple-100 text-purple-800 font-semibold"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <Divider className="my-6 border-white/20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mb-6"
      >
        <Typography variant="h6" className="text-white font-semibold mb-3">
          Actions
        </Typography>
        
        <div className="space-y-3">
          <Button
            variant="outlined"
            fullWidth
            startIcon={<RefreshIcon />}
            className="text-white border-white/30 hover:border-white/50 hover:bg-white/10"
            onClick={() => window.location.reload()}
          >
            Refresh Chat
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<ClearIcon />}
            className="text-red-400 border-red-400/30 hover:border-red-400/50 hover:bg-red-400/10"
            onClick={onClearMessages}
          >
            Clear History
          </Button>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="mt-auto"
      >
        <Button
          variant="contained"
          fullWidth
          startIcon={<LogoutIcon />}
          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
          onClick={onLogout}
        >
          Sign Out
        </Button>
      </motion.div>
    </motion.div>
  );
} 