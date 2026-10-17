import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://zlisto.github.io/game_algebraic_topology/
export default defineConfig({
  plugins: [react()],
  base: '/game_algebraic_topology/',
})
