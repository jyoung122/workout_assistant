import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Check if we're in production based on Vite's mode
// eslint-disable-next-line no-undef
const isProduction = process.env.NODE_ENV === "production";


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.gltf", "**/*.glb"],
  ase: isProduction ? "/workout_assistant/" : "/",
})
