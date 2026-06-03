import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import authService from '@/services/auth.service'
import useAuthStore from '@/store/useAuthStore'

// ── One-time session restore ───────────────────────────────────────────────
// Runs before React renders anything.
// Waits for Zustand to rehydrate from localStorage, then loads Supabase session.
// This is outside React so HMR never re-runs it.
//
const unsub = useAuthStore.subscribe(
  (state) => state._hasHydrated,
  (hydrated) => {
    if (hydrated) {
      unsub(); // unsubscribe immediately — only run once
      authService.loadUserFromSession().catch(() => {});
    }
  }
);

createRoot(document.getElementById('root')).render(
  <>
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background:   '#2e3038',
          color:        '#e2e3e6',
          border:       '1px solid #3b3f4b',
          borderRadius: '0.625rem',
          fontSize:     '0.875rem',
          fontFamily:   '"DM Sans", sans-serif',
          boxShadow:    '0 8px 32px 0 rgb(0 0 0 / 0.14)',
          padding:      '10px 14px',
        },
        success: { iconTheme: { primary: '#d8901f', secondary: '#2e3038' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#2e3038' } },
        loading: { iconTheme: { primary: '#d8901f', secondary: '#2e3038' } },
      }}
    />
    <App />
  </>
)