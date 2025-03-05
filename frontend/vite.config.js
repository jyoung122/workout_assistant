import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Check if we're in production based on Vite's mod

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.gltf", "**/*.glb"],
  base:  "/workout_assistant/",
})
