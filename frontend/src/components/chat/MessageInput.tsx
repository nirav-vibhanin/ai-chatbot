'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TextField, 
  IconButton, 
  Box,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  Send as SendIcon
} from '@mui/icons-material';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isSending?: boolean;
}

export function MessageInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message...",
  isSending = false
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const isSendDisabled = !message.trim() || disabled;
  const isDisabled = disabled || isSendDisabled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        className="flex items-end space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
      >
        <div className="flex-1 relative">
          <TextField
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            multiline
            maxRows={4}
            disabled={disabled}
            variant="outlined"
            fullWidth
            className="input-primary"
            InputProps={{
              className: 'rounded-xl text-gray-800',
              style: {
                fontSize: '1rem',
                lineHeight: '1.5',
                padding: '12px 16px',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
              },
            }}
          />
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-2 -right-2"
            >
              <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                typing...
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSending ? (
              <Tooltip title="Sending message...">
                <span>
                  <IconButton
                    type="submit"
                    disabled={true}
                    className="bg-gray-300 text-gray-500 shadow-lg transition-all duration-200"
                    size="large"
                  >
                    <CircularProgress size={20} className="text-white" />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <Tooltip title="Send message">
                <span>
                  <IconButton
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className={`${
                      message.trim() && !disabled
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl' 
                        : 'bg-gray-300 text-gray-500'
                    } transition-all duration-200`}
                    size="large"
                  >
                    <SendIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </motion.div>
        </div>
      </Box>

      {message.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-500 mt-2 text-right"
        >
          {message.length} characters
        </motion.div>
      )}
    </motion.div>
  );
} 