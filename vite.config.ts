/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// BASE_PATH : sous-chemin d'hébergement (ex. /mia/ pour GitHub Pages). Par défaut, racine.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'apple-touch-icon.png', 'fonts/*.woff2'],
      manifest: {
        name: 'MIA',
        short_name: 'MIA',
        lang: 'fr',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#FFF8FA',
        theme_color: '#713B61',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: { navigateFallback: 'index.html', globPatterns: ['**/*.{js,css,html,svg,woff2,png}'] },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: { include: ['src/domain/**'], thresholds: { lines: 95 } },
  },
});
