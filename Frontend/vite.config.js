import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react'



export default defineConfig({
  plugins: [tailwindcss(), react()],

  define: {
    'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL),
    // or more commonly:
    // 'process.env': {}   ← if you want all env vars
  },
})
