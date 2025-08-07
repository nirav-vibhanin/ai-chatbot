'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Chip,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';

interface ChatHeaderProps {
  isConnected: boolean;
  onLogout: () => void;
}

export function ChatHeader({ isConnected, onLogout }: ChatHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <AppBar 
        position="static" 
        className="glass backdrop-blur-xl border-b border-white/20 shadow-lg"
        sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        <Toolbar className="px-4">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            className="lg:hidden mr-3"
          >
            <MenuIcon />
          </IconButton>

          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex items-center flex-1"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <BotIcon className="text-white text-xl" />
              </motion.div>
              <div>
                <Typography variant="h6" className="gradient-text font-bold">
                  AI Chatbot
                </Typography>
                <Typography variant="caption" className="text-gray-300">
                  Powered by Gemini AI
                </Typography>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mr-4"
          >
            <Chip
              icon={isConnected ? <WifiIcon /> : <WifiOffIcon />}
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              size="small"
              className={`${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <IconButton
              onClick={handleMenuOpen}
              className="text-white hover:bg-white/20"
            >
              <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600">
                <PersonIcon />
              </Avatar>
            </IconButton>
          </motion.div>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            className="mt-2"
            PaperProps={{
              className: 'glass backdrop-blur-xl border border-white/20 shadow-xl',
              sx: {
                minWidth: 200,
                borderRadius: 2,
              }
            }}
          >
            <MenuItem onClick={handleMenuClose} className="flex items-center space-x-3">
              <PersonIcon className="text-gray-500" />
              <div>
                <Typography variant="body2" className="font-semibold">
                  Admin User
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  admin@example.com
                </Typography>
              </div>
            </MenuItem>
            
            <Divider className="my-1" />
            
            <MenuItem onClick={handleMenuClose} className="flex items-center space-x-3">
              <SettingsIcon className="text-gray-500" />
              <Typography variant="body2">Settings</Typography>
            </MenuItem>
            
            <Divider className="my-1" />
            
            <MenuItem 
              onClick={() => {
                handleMenuClose();
                onLogout();
              }}
              className="flex items-center space-x-3 text-red-600 hover:text-red-700"
            >
              <LogoutIcon />
              <Typography variant="body2">Sign Out</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </motion.div>
  );
} 