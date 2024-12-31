import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Field Visit Report',
        short_name: 'Field Visits',
        description: 'App to upload and see the field visit reports of colleges in Bihar',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/bihar-govt.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/bihar-govt.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
