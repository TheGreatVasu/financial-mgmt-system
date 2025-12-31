const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  plugins: [react()],
  // Suppress informational messages from transitive dependencies
  logLevel: 'warn',
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separate vendor chunks for better caching
          if (id.includes('node_modules')) {
            // React and router
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // AG Grid (large library)
            if (id.includes('ag-grid')) {
              return 'ag-grid';
            }
            // Handsontable (large library)
            if (id.includes('handsontable') || id.includes('hyperformula')) {
              return 'handsontable';
            }
            // Chart library
            if (id.includes('recharts')) {
              return 'charts';
            }
            // PDF/Image libraries
            if (id.includes('html-to-image') || id.includes('jspdf')) {
              return 'pdf-html';
            }
            // Excel library
            if (id.includes('xlsx')) {
              return 'xlsx';
            }
            // Socket.io
            if (id.includes('socket.io')) {
              return 'socketio';
            }
            // Other node_modules go into vendor chunk
            return 'vendor';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Increase chunk size warning limit (ag-grid and handsontable are large)
    chunkSizeWarningLimit: 1000
  }
})
