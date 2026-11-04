import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const clientSlugs = [
  'de-kleinste-kapsalon',
  'feel-smooth',
  'hondentrimsalon-finn',
  'kapsalon-faya',
  'kapsalon-headline',
  'kapsalon-issa',
  'kapsalon-van-haaren',
  'polat-beauty',
  'salonyourbeauty',
  'trimsalon-het-hofje',
  'trimsalon-limbo',
  'violettas-dog-grooming',
];

const inputEntries: Record<string, string> = {
  main: path.resolve(__dirname, 'index.html'),
};

clientSlugs.forEach((slug) => {
  inputEntries[slug] = path.resolve(__dirname, `clients/${slug}/index.html`);
});

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: inputEntries,
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});

