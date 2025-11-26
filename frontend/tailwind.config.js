/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        maatram: {
          yellow: '#FFD700', // Gold
          'yellow-light': '#FFE57F',
          'yellow-dark': '#FFA000',
          'yellow-hover': '#FFC107',
          black: '#1A1A1A', // Soft black
          'black-light': '#2D2D2D',
          'black-dark': '#000000',
          white: '#FFFFFF',
          'white-off': '#F9FAFB', // Cool gray
          gray: '#9CA3AF',
          'gray-light': '#F3F4F6',
          primary: '#FFD700',
          secondary: '#1A1A1A',
          accent: '#3B82F6', // Blue accent
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'card': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

