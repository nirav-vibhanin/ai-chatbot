'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { setToken, setUser, clearAuth } from '@/store/slices/authSlice';
import { getCurrentUser } from '@/utils/userUtils';
import Cookies from 'js-cookie';

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

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = Cookies.get('token');
        if (token) {
          console.log('🔑 Found token in cookies, restoring auth state...');
          
          const tokenPayload = parseJwtToken(token);
          let user = null;
          
          if (tokenPayload && tokenPayload.id) {
            user = {
              id: tokenPayload.id || tokenPayload.userId,
              email: tokenPayload.email || '',
              name: tokenPayload.name || tokenPayload.username || '',
            };
            console.log('👤 Found user data from token:', user);
          } else {
            user = getCurrentUser();
            console.log('👤 Found user data from storage:', user);
          }
          
          if (user) {
            dispatch(setToken(token));
            dispatch(setUser({
              id: user.id,
              username: user.name,
              email: user.email,
            }));
            
            console.log('Auth state restored successfully');
          } else {
            console.log('Token exists but no user data found');
            Cookies.remove('token');
            // Ensure Redux auth state reflects that there is no valid session
            dispatch(clearAuth());
          }
        } else {
          console.log('No token found in cookies');
          // Ensure we start from a clean unauthenticated state
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
  }, [dispatch]);

  if (!initialized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
