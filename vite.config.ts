import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Keep React and ReactDOM together to avoid context errors
          if (id.includes('node_modules')) {
            // Bundle React, ReactDOM and React Router together
            if (id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('react') && !id.includes('react-dom') && !id.includes('recharts')) {
              return 'react-vendor';
            }
            // Keep Radix UI separate
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // Keep Supabase separate
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // Keep React Query separate
            if (id.includes('@tanstack')) {
              return 'query-vendor';
            }
            // Don't separate recharts to avoid initialization issues
            // Let it be bundled with other vendors
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
