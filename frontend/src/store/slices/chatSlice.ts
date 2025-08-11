import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  sender: 'user' | 'bot';
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isStreaming: boolean;
  currentStreamingMessage: string;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  isStreaming: false,
  currentStreamingMessage: '',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
      state.isStreaming = false;
      state.currentStreamingMessage = '';
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      if (!Array.isArray(state.messages)) {
        state.messages = [];
      }
      state.messages.push(action.payload);
    },
    updateStreamingMessage: (state, action: PayloadAction<string>) => {
      state.currentStreamingMessage += action.payload;
      state.isStreaming = true;
    },
    completeStreamingMessage: (state, action: PayloadAction<ChatMessage>) => {
      if (!Array.isArray(state.messages)) {
        state.messages = [];
      }
      
      const existingMessageIndex = state.messages.findIndex(msg => msg.id === action.payload.id);
      if (existingMessageIndex === -1) {
        state.messages.push(action.payload);
      }
      
      state.isStreaming = false;
      state.currentStreamingMessage = '';
    },
    setStreaming: (state, action: PayloadAction<boolean>) => {
      state.isStreaming = action.payload;
      if (!action.payload) {
        state.currentStreamingMessage = '';
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetLoading: (state) => {
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload || [];
    },
  },
  extraReducers: () => {},
});

export const { 
  clearMessages, 
  addMessage, 
  updateStreamingMessage, 
  completeStreamingMessage,
  setStreaming,
  clearError,
  resetLoading,
  setLoading,
  setMessages
} = chatSlice.actions;

export default chatSlice.reducer; 