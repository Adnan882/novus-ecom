import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['serveousercontent.com', '.serveousercontent.com'],
  },
  build: {
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules\/(three)\// },
            { name: 'r3f', test: /node_modules\/(@react-three)\// },
            { name: 'motion', test: /node_modules\/(framer-motion|motion)\// },
            { name: 'firebase', test: /node_modules\/(firebase|@firebase)\// },
          ],
        },
      },
    },
  },
})