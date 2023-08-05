import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), svgrPlugin(), VitePWA({
    manifest: {
      "name": "JiYou",
      "short_name": "JiYou",
      "icons": [
        {
          "src": "JiYouIcon.svg",
          "sizes": "64x64 32x32 24x24 16x16",
          "type": "image/svg"
        }
      ],
      "start_url": ".",
      "display": "standalone",
      "orientation": "portrait"
    },
    workbox:{}
})],
  resolve: {
    alias: {
      '@okta/okta-auth-js': '@okta/okta-auth-js/dist/okta-auth-js.umd.js',
    },
  },
});

