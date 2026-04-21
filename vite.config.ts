import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'WESEKAI - Preference Vector Field Simulator',
          short_name: 'WESEKAI',
          description: 'Advanced recommendation engine for Isekai and Fantasy discovery.',
          theme_color: '#09090b',
          background_color: '#09090b',
          display: 'standalone',
          icons: [
            {
              src: 'favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/cdn\.myanimelist\.net\/images\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'mal-images-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/s4\.anilist\.co\/file\/anilistcdn\/media\/manga\/cover\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'anilist-images-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/api\.jikan\.moe\/v4\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'jikan-api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 24 Hours
                },
              },
            },
            {
              urlPattern: /^https:\/\/graphql\.anilist\.co\//i,
              handler: 'NetworkFirst',
              method: 'POST',
              options: {
                cacheName: 'anilist-api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 24 Hours
                },
              },
            },
            {
              urlPattern: /^https:\/\/www\.googleapis\.com\/youtube\/v3\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'youtube-api-cache',
                expiration: {
                  maxEntries: 25,
                  maxAgeSeconds: 60 * 60 * 24, // 24 Hours
                },
              },
            },
            {
              urlPattern: /^\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'local-api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 24 Hours
                },
              },
            },
          ],
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
