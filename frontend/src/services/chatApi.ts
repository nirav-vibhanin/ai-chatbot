import { apiService } from './api';
import { ChatMessage } from '@/store/slices/chatSlice';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  id: string;
  userId: string;
  message: string;
  sender: 'user' | 'bot';
  createdAt: string;
  updatedAt: string;
}

export const chatApi = {
  getChatHistory: async (): Promise<ChatMessage[]> => {
    const response = await apiService.get<any>('/chat');
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object' && 'messages' in response.data) {
      return response.data.messages || [];
    } else {
      return [];
    }
  },

  sendMessage: async (message: string): Promise<SendMessageResponse> => {
    const response = await apiService.post<SendMessageResponse>('/chat', { message });
    return response.data;
  },

  getChatStats: async () => {
    const response = await apiService.get('/chat/stats');
    return response.data;
  },
}; 

export function useChatHistoryQuery() {
  return useQuery({
    queryKey: ['chat', 'history'],
    queryFn: chatApi.getChatHistory,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['chat', 'send'],
    mutationFn: (message: string) => chatApi.sendMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'history'] });
    },
  });
}