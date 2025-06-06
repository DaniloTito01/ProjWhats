/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'purple-creativity': '#7F00FF',
        'blue-trust': '#0057FF',
        'black-sophistication': '#0D0D0D',
        'neon-green': '#39FF14',
        'electric-orange': '#FF4500',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

