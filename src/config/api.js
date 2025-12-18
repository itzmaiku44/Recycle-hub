// API configuration - uses environment variable or detects environment at runtime
// In production (Vercel), use relative paths; in development, use localhost

// Check if we're on localhost (development) at runtime
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname.startsWith('192.168.') ||
   window.location.hostname === '');

// Use environment variable if set, otherwise detect based on hostname
export const API_BASE = import.meta.env.VITE_API_BASE || 
  (isLocalhost ? 'http://localhost:4000/api' : '/api');

// API_ORIGIN: In production, use empty string for relative paths (browser will use current origin)
// Or set VITE_API_ORIGIN to your Vercel domain (e.g., https://your-app.vercel.app)
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 
  (isLocalhost ? 'http://localhost:4000' : '');
