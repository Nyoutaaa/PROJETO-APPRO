/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'ui-sans-serif', 'system-ui']
      },
      filter: {
        'black': 'brightness(0) saturate(100%)',
        'white': 'brightness(0) saturate(100%) invert(1)'
      }
    }
  },
  plugins: []
}
