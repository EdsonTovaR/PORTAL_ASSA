/** @type {import('tailwindcss').Config} */
export default {
  // Aquí le decimos a Tailwind que lea todos nuestros archivos de React
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Más adelante, aquí podemos agregar los colores oficiales del logo de ASSA
      colors: {
        'assa-dark': '#121212',
        'assa-blue': '#0056b3',
      }
    },
  },
  plugins: [],
}