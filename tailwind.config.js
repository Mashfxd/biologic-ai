/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ¡La magia para el modo oscuro!
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};