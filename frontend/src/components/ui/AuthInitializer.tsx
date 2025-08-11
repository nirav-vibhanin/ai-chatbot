'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { setToken, setUser, clearAuth } from '@/store/slices/authSlice';
import { getCurrentUser } from '@/utils/userUtils';
import Cookies from 'js-cookie';
import { chatApi } from '@/services/chatApi';

function parseJwtToken(token: string) { 
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
}

interface AuthInitializerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthInitializer({ children, fallback = null }: AuthInitializerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [initialized, setInitialized] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = Cookies.get('token');
        if (token) {
          console.log('🔑 Found token in cookies, restoring auth state...');
          
          const tokenPayload = parseJwtToken(token);
          let user = null;

          if (tokenPayload) {
            const id = tokenPayload.sub || tokenPayload.id || tokenPayload.userId;
            if (id) {
              user = {
                id,
                email: tokenPayload.email || '',
                name: tokenPayload.username || tokenPayload.name || '',
              };
              console.log('Found user data from token:', user);
            }
          }

          if (!user) {
            user = getCurrentUser();
            console.log('Found user data from storage:', user);
          }
          
          if (user) {
            dispatch(setToken(token));
            dispatch(setUser({ id: user.id, username: user.name || 'user', email: user.email }));
            // Prefetch chat history to reduce first contentful render time
            queryClient.prefetchQuery({ queryKey: ['chat', 'history'], queryFn: chatApi.getChatHistory });
            
            console.log('Auth state restored successfully');
          } else {
            console.log('Token exists but no user data found');
            Cookies.remove('token');
            dispatch(clearAuth());
          }
        } else {
          console.log('No token found in cookies');
          dispatch(clearAuth());
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        Cookies.remove('token');
        dispatch(clearAuth());
      }
    };

    initializeAuth();
    setInitialized(true);
  }, [dispatch, queryClient]);

  if (!initialized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
