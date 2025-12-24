import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh for better development performance
      fastRefresh: true,
      babel: {
        plugins: [
          // Add babel plugins for better optimization
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    runtimeErrorOverlay(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    // Optimize build performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies into separate chunks
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/database'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          'vendor': ['react', 'react-dom', 'wouter'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'query': ['@tanstack/react-query'],
        },
      },
    },
    // Enable minification and compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Improve dev server performance
    hmr: {
      overlay: false, // Disable error overlay for better performance
    },
    // Pre-bundle dependencies for faster cold starts
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'firebase/app',
        'firebase/auth', 
        'firebase/database',
        '@tanstack/react-query',
        'wouter',
        'react-hook-form',
        'zod',
        'lucide-react'
      ],
      exclude: ['@replit/vite-plugin-runtime-error-modal']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
      }
    }
  },
  // Enable CSS code splitting
  css: {
    devSourcemap: false, // Disable CSS sourcemaps in dev for better performance
  },
  // Improve performance with esbuild
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
