/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
          colors: {
            brandPrimary: '#1E40AF',   // Indigo-800
            brandSecondary: '#1E3A8A', // Indigo-900
            brandAccent: '#E5E7EB',    // Gray-100
          },
        },
      },
    plugins: [],
  }