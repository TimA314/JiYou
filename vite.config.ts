import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    viteTsconfigPaths(), 
    svgrPlugin(), 
    VitePWA({
      filename: 'sw.ts',
      includeAssets: ['*.svg'],
      manifest: {
        "name": "JiYou",
        "short_name": "JiYou",
        "theme_color": "#ffffff",
        "background_color": "#ffffff",
        "display": "standalone",
        "scope": "/",
        "start_url": "/",
        "orientation": "portrait-primary",
        "icons": [
          {
            "src": "/public/JiYouIcon.svg",
            "sizes": "192x192",
            "type": "image/svg"
          },
          {
            "src": "/public/JiYouIcon.svg",
            "sizes": "512x512",
            "type": "image/svg"
          }
        ]
      },
      srcDir: 'src/service-worker',
      strategies: 'injectManifest'
    })
  ],
  resolve: {
    alias: {
      '@okta/okta-auth-js': '@okta/okta-auth-js/dist/okta-auth-js.umd.js',
    },
  },
});

