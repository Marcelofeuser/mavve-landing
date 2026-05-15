/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wine: { DEFAULT: '#6B1A2B', dark: '#4A0F1E', light: '#8B2439' },
        gold: { DEFAULT: '#C9A84C', light: '#E8C97A', pale: '#F5EDD5' },
        cream: { DEFAULT: '#FAF7F2', dark: '#F0EAE0' },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Jost', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
