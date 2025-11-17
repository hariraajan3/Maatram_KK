/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f8f4',
          100: '#d4ecde',
          300: '#74c69d',
          500: '#2f9e44',
          700: '#1c7c32',
        },
      },
    },
  },
  plugins: [],
};

