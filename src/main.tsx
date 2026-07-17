import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { useSupabaseServices } from './services/swap';
import App from './App';
import './styles/index.css';

// Always use Supabase services (exec-bootstrap.js bridge may also be present
// for embedded mode, but service layer should always hit Supabase directly).
useSupabaseServices();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);
