/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        maatram: {
          // softened main yellow to reduce brightness
          yellow: '#FFEB99',
          'yellow-light': '#FFE44D',
          'yellow-dark': '#FFC107',
          'yellow-hover': '#FFEB3B',
          black: '#000000',
          'black-light': '#1a1a1a',
          'black-dark': '#000000',
          white: '#FFFFFF',
          'white-off': '#FAFAFA',
        },
        brand: {
          50: '#fffef0',
          100: '#fffde0',
          300: '#FFD700',
          500: '#FFC107',
          700: '#FFA000',
        },
      },
    },
  },
  plugins: [],
};

