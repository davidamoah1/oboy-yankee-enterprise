import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.png', 'apple-touch-icon.png'],
        manifest: {
          short_name: 'OBOY YANKEE',
          name: 'OBOY YANKEE ENTERPRISE',
          description: 'Offline-first POS, inventory, and business management platform.',
          start_url: '/dashboard',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#090d16',
          theme_color: '#10b981',
          icons: [
            {
              src: '/icon-192.png',
              type: 'image/png',
              sizes: '192x192',
              purpose: 'any',
            },
            {
              src: '/icon-512.png',
              type: 'image/png',
              sizes: '512x512',
              purpose: 'any',
            },
            {
              src: '/icon-maskable.png',
              type: 'image/png',
              sizes: '512x512',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          navigationPreload: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
            {
              urlPattern: /\/api\/products/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-products-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24,
                },
              },
            },
            {
              urlPattern: /\/api\/dashboard\/.*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-dashboard-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 5,
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    optimizeDeps: {
      include: [
        'react', 'react-dom', 'react-router-dom',
        'lucide-react', 'motion/react', 'recharts',
        'sonner', '@tanstack/react-query', 'zustand',
        'clsx', 'tailwind-merge', 'date-fns',
      ],
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'chart-vendor': ['recharts'],
            'ui-vendor': ['lucide-react', 'motion/react', 'sonner'],
          },
        },
      },
    },
  };
});
