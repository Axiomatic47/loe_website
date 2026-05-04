// src/hooks/useNetlifyIdentity.ts
// Custom hook for Netlify Identity authentication state

import { useState, useEffect, useCallback } from 'react';

interface NetlifyUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  app_metadata?: {
    roles?: string[];
    [key: string]: unknown;
  };
}

interface UseNetlifyIdentityReturn {
  user: NetlifyUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

export function useNetlifyIdentity(): UseNetlifyIdentityReturn {
  const [user, setUser] = useState<NetlifyUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for Netlify Identity to be available
    const initIdentity = () => {
      if (window.netlifyIdentity) {
        // Get current user on mount
        const currentUser = window.netlifyIdentity.currentUser();
        setUser(currentUser);
        setIsLoading(false);

        // Listen for auth state changes
        window.netlifyIdentity.on('login', (loggedInUser) => {
          setUser(loggedInUser || null);
        });

        window.netlifyIdentity.on('logout', () => {
          setUser(null);
        });

        window.netlifyIdentity.on('init', (initUser) => {
          setUser(initUser || null);
          setIsLoading(false);
        });
      } else {
        // Retry after a short delay if not loaded yet
        setTimeout(initIdentity, 100);
      }
    };

    initIdentity();

    // Cleanup listeners on unmount
    return () => {
      if (window.netlifyIdentity) {
        window.netlifyIdentity.off('login');
        window.netlifyIdentity.off('logout');
        window.netlifyIdentity.off('init');
      }
    };
  }, []);

  const login = useCallback(() => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.open();
    }
  }, []);

  const logout = useCallback(() => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.logout();
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };
}

export default useNetlifyIdentity;
