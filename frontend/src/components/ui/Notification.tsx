'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle } from '@mui/material';
import { 
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';

interface NotificationProps {
  open: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function Notification({ 
  open, 
  type, 
  title, 
  message, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: NotificationProps) {
  const getIcon = () => {
    switch (type) {
      case 'info':
        return <InfoIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'success':
        return <SuccessIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  React.useEffect(() => {
    if (open && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [open, autoClose, duration, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <Alert 
            severity={getColor()}
            icon={getIcon()}
            onClose={onClose}
            className="glass backdrop-blur-xl border border-white/20 shadow-xl"
          >
            <AlertTitle className="font-semibold">{title}</AlertTitle>
            <div className="text-sm mt-1">{message}</div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 