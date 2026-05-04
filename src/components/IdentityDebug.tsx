// src/components/IdentityDebug.tsx - Temporary debugging component
import React, { useEffect, useState } from 'react';

export const IdentityDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkIdentity = () => {
      const info = {
        hash: window.location.hash,
        pathname: window.location.pathname,
        search: window.location.search,
        identityLoaded: !!window.netlifyIdentity,
        currentUser: window.netlifyIdentity?.currentUser?.() || null,
        hasInviteToken: window.location.hash.includes('invite_token'),
        hasConfirmationToken: window.location.hash.includes('confirmation_token'),
        fullUrl: window.location.href,
        timestamp: new Date().toISOString()
      };

      setDebugInfo(info);
      console.log('Identity Debug Info:', info);
    };

    checkIdentity();

    // Check every 2 seconds
    const interval = setInterval(checkIdentity, 2000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development or if there are tokens
  if (!import.meta.env.DEV && !debugInfo.hasInviteToken && !debugInfo.hasConfirmationToken) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg border border-white/20 max-w-md text-xs font-mono">
      <h3 className="font-bold mb-2">Identity Debug</h3>
      <div className="space-y-1">
        <div>URL: {debugInfo.fullUrl}</div>
        <div>Hash: {debugInfo.hash || 'none'}</div>
        <div>Identity Loaded: {debugInfo.identityLoaded ? '✅' : '❌'}</div>
        <div>Has Invite Token: {debugInfo.hasInviteToken ? '✅' : '❌'}</div>
        <div>Has Confirmation Token: {debugInfo.hasConfirmationToken ? '✅' : '❌'}</div>
        <div>Current User: {debugInfo.currentUser?.email || 'none'}</div>
        <div>Time: {debugInfo.timestamp}</div>
      </div>

      {(debugInfo.hasInviteToken || debugInfo.hasConfirmationToken) && (
        <button
          onClick={() => window.netlifyIdentity?.open?.()}
          className="mt-2 px-2 py-1 bg-blue-600 rounded text-white"
        >
          Open Identity Modal
        </button>
      )}
    </div>
  );
};