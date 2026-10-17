import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://zlisto.github.io/game_algebraic_topology/
// Built files go to /docs so Pages can serve them from the main branch.
export default defineConfig({
  plugins: [react()],
  base: '/game_algebraic_topology/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
