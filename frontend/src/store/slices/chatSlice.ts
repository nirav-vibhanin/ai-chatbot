import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatApi } from '@/services/chatApi';

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

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatApi.getChatHistory();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat history');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message: string, { rejectWithValue }) => {
    try {
      const response = await chatApi.sendMessage(message);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both array and object with messages property
        if (Array.isArray(action.payload)) {
          state.messages = action.payload;
        } else if (action.payload && typeof action.payload === 'object' && 'messages' in action.payload) {
          state.messages = (action.payload as any).messages || [];
        } else {
          state.messages = [];
        }
        state.error = null;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        // The message will be added via WebSocket streaming
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearMessages, 
  addMessage, 
  updateStreamingMessage, 
  completeStreamingMessage,
  setStreaming,
  clearError,
  resetLoading
} = chatSlice.actions;

export default chatSlice.reducer; 