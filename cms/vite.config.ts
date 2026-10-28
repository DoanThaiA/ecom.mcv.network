import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------

const PORT = 3000;

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Temporarily disabled type checking during gRPC to REST migration
    // checker({
    //   typescript: true,
    //   eslint: {
    //     lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
    //     dev: { logLevel: ['error'] },
    //   },
    //   overlay: {
    //     position: 'tl',
    //     initialIsOpen: true,
    //   },
    // }),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: { port: PORT, host: true },
  preview: {
    port: PORT,
    host: true,
    allowedHosts: [
      'cms.cchat.vn',
      'internalcms.cchat.vn',
      'cchatcms.mmenu.io',
      'internalcchatcms.mmenu.io',
      'stagingcchatcms.mmenu.io',
    ],
  },
  optimizeDeps: {
    include: ['tslib', 'react-dropzone', 'file-selector'],
  },
  build: {
    commonjsOptions: {
      include: [/tslib/, /node_modules/],
    },
    rollupOptions: {
      // Externalize gRPC imports that are being migrated to REST API
      external: [/^grpc-web-client-gen\/.*/, /^src\/proto\/generated\/.*/, /^src\/redux\/apis\/.*/],
    },
  },
}));
