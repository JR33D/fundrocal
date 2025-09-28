import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/fundrocal/', // replace with your repo name
  plugins: [react()],
});
