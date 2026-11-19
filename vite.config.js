
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],

  build: {
    rolldownOptions: {
      output: {
        strictExecutionOrder: true,

        codeSplitting: {
          groups: [
            {
              name: 'react-core',
              test: /[\\/]node_modules[\\/](?:react|react-dom|scheduler)(?:[\\/]|$)/,
              priority: 40,
            },
            {
              name: 'firebase-firestore',
              test: /[\\/]node_modules[\\/](?:@firebase[\\/]firestore|firebase[\\/]firestore)(?:[\\/]|$)/,
              priority: 35,
            },
            {
              name: 'firebase-auth',
              test: /[\\/]node_modules[\\/](?:@firebase[\\/]auth|firebase[\\/]auth)(?:[\\/]|$)/,
              priority: 30,
            },
            {
              name: 'firebase-core',
              test: /[\\/]node_modules[\\/](?:@firebase|firebase)[\\/]/,
              priority: 20,
            },
          ],
        },
      },
    },
  },
});
