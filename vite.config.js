import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  appType: 'spa',
  server: {
    // Visual-QA helpers create and remove temporary HTML files in the project
    // root. Watching them causes a full-page reload that can interrupt route
    // transitions even though the application source has not changed.
    watch: {
      ignored: ['**/qa-*.html'],
    },
  },
})
