'use client'

import { Box, Typography, Paper, CircularProgress } from '@mui/material'
import { Person, SmartToy } from '@mui/icons-material'

interface Message {
  id: string
  userId: string
  message: string
  sender: 'user' | 'bot'
  createdAt: string
  updatedAt: string
}

interface MessageListProps {
  messages: Message[]
  streaming: boolean
  currentStreamingMessage: string
  messagesEndRef: React.RefObject<HTMLDivElement>
}

export default function MessageList({ 
  messages, 
  streaming, 
  currentStreamingMessage, 
  messagesEndRef 
}: MessageListProps) {
  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
            mb: 2,
          }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 2,
              maxWidth: '70%',
              backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.100',
              color: message.sender === 'user' ? 'white' : 'text.primary',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              {message.sender === 'user' ? (
                <Person sx={{ mr: 1, fontSize: 20 }} />
              ) : (
                <SmartToy sx={{ mr: 1, fontSize: 20 }} />
              )}
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {message.sender === 'user' ? 'You' : 'AI Assistant'}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.message}
            </Typography>
          </Paper>
        </Box>
      ))}

      {streaming && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              maxWidth: '70%',
              backgroundColor: 'grey.100',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SmartToy sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                AI Assistant
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mr: 1 }}>
                {currentStreamingMessage}
              </Typography>
              <CircularProgress size={16} />
            </Box>
          </Paper>
        </Box>
      )}

      <div ref={messagesEndRef} />
    </Box>
  )
} 