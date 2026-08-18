import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables based on mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');
  const root = process.cwd();

  return {
    base: './',

    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    plugins: [react()],

    define: {
      // Client-safe public environment variables
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.STRIPE_PUBLISHABLE_KEY),
      'process.env.PLAID_CLIENT_ID': JSON.stringify(env.PLAID_CLIENT_ID),
      'process.env.PLAID_ENV': JSON.stringify(env.PLAID_ENV || 'sandbox'),
    },

    resolve: {
      alias: {
        '@': path.resolve(root, 'src'),
      },
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(root, 'index.html'),
        },
      },
    },
  };
});
