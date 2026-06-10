/**
 * Configuração do Vite.
 * Plugin @vitejs/plugin-react habilita Fast Refresh (HMR) e suporte a JSX.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
