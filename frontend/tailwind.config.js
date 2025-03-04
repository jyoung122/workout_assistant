/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
          colors: {
            brandPrimary: '#1E40AF',   // e.g., Indigo-800
            brandSecondary: '#1E3A8A', // e.g., Indigo-900
            brandAccent: '#E5E7EB',    // e.g., Gray-100
            // add more if desired
          },
        },
      },
    plugins: [],
  }