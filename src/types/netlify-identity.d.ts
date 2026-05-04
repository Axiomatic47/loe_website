// src/types/netlify-identity.d.ts
// TypeScript definitions for Netlify Identity Widget

declare global {
  interface Window {
    netlifyIdentity: {
      init: () => void;
      open: () => void;
      close: () => void;
      currentUser: () => NetlifyUser | null;
      refresh: () => Promise<void>;
      logout: () => void;
      on: (event: string, callback: (user?: NetlifyUser) => void) => void;
      off: (event: string, callback?: (user?: NetlifyUser) => void) => void;
    };
  }
}

interface NetlifyUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  app_metadata?: {
    roles?: string[];
    security_clearance?: string;
    [key: string]: any;
  };
  token?: {
    access_token: string;
    expires_at: string;
    refresh_token: string;
    token_type: string;
  };
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
}

export {};