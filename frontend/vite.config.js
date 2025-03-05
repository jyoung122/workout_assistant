import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Determine the base URL based on the environment
const BASE_URL =
  import.meta.env.MODE === "production"
    ? "/workout_assistant/" // For GitHub Pages
    : "/"; // For local development

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.gltf", "**/*.glb"],
  base: BASE_URL
})
