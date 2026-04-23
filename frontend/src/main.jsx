import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider }      from '@context/AuthContext';
import { WorkspaceProvider } from '@context/WorkspaceContext';
import AppRouter from './router';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries:   { retry: 1, staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false },
    mutations: { retry: 0 }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WorkspaceProvider>
          <AppRouter />
          <Toaster position="top-right" gutter={8} toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b', color: '#f1f5f9',
              border: '1px solid #334155', borderRadius: '10px',
              fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif'
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } }
          }}/>
        </WorkspaceProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
