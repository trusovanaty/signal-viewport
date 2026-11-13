import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const path = (file: string) => fileURLToPath(new URL(file, import.meta.url));

// apps/preview holds the showcase page (index.html) and the workbench (workbench.html); `@/` imports reach the skin in src/.
export default defineConfig({
  root: path('./apps/preview'),
  // Several pages, no single-page fallback: an unknown address gets 404.html (the custom 404 page) instead of the landing.
  appType: 'mpa',
  // Relative URLs, so the build works at a domain root or in a subfolder such as GitHub Pages.
  base: './',
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@preview': path('./apps/preview/src'),
      '@': path('./src'),
    },
  },
  server: {
    fs: { allow: [path('.')] },
  },
  build: {
    outDir: path('./dist'),
    emptyOutDir: true,
    rolldownOptions: {
      // The showcase page (the entry), the workbench shell, and the preview page the workbench frames.
      input: {
        showcase: path('./apps/preview/index.html'),
        workbench: path('./apps/preview/workbench.html'),
        preview: path('./apps/preview/preview.html'),
      },
    },
  },
});
