'use client'

import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Container,
} from '@mui/material'
import { Send, Logout } from '@mui/icons-material'
import { logout } from '@/store/slices/authSlice'
import { fetchChatHistory, sendMessage, addMessage, updateStreamingMessage, completeStreamingMessage } from '@/store/slices/chatSlice'
import { chatApi } from '@/services/chatApi'
import { useSocket } from '@/hooks/useSocket'
import MessageList from './MessageList'

export default function ChatInterface() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { messages, isLoading, isStreaming, currentStreamingMessage } = useSelector((state: RootState) => state.chat)
  const [message, setMessage] = useState('')
  const socket = useSocket() as any
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dispatch(fetchChatHistory())
  }, [dispatch])

  useEffect(() => {
    if (socket && user) {
      socket.emit('join', user.id)
      
      socket.on('stream-chunk', (data: { chunk: string; isComplete: boolean }) => {
        if (data.isComplete) {
          const botMessage = {
            id: Date.now().toString(),
            userId: user.id,
            message: currentStreamingMessage + data.chunk,
            sender: 'bot' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          dispatch(completeStreamingMessage(botMessage))
        } else {
          dispatch(updateStreamingMessage(data.chunk))
        }
      })
    }

    return () => {
      if (socket) {
        socket.off('stream-chunk')
      }
    }
  }, [socket, user, currentStreamingMessage, dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentStreamingMessage])



  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || isStreaming) return

    const userMessage = {
      id: Date.now().toString(),
      userId: user!.id,
      message: message.trim(),
      sender: 'user' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dispatch(addMessage(userMessage))
    setMessage('')
    dispatch(sendMessage(message.trim()))
  }

  const handleLogout = () => {
    dispatch(logout())
    if (socket) {
      socket.disconnect()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Welcome, {user?.username}!
        </Typography>
        <IconButton onClick={handleLogout} color="error">
          <Logout />
        </IconButton>
      </Box>

      <Paper elevation={3} sx={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
        <MessageList 
          messages={messages} 
          streaming={isStreaming}
          currentStreamingMessage={currentStreamingMessage}
          messagesEndRef={messagesEndRef}
        />
        
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || isStreaming}
              multiline
              maxRows={3}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading || isStreaming}
              sx={{ minWidth: 56 }}
            >
              <Send />
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
} 