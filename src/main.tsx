import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { useSupabaseServices } from './services/swap';
import App from './App';
import './styles/index.css';

// Use Supabase for production data when not running in bridge mode.
// In bridge mode (embedded in Student Portal), the bridge backend
// already wraps Supabase, so services fall back to mock-safe defaults.
if (!(window as any).__PHYSIOK29_BACKEND__) {
  useSupabaseServices();
  console.log('[PhysioK29] Standalone mode — using Supabase services');
} else {
  console.log('[PhysioK29] Bridge mode — using bridge provider');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);
