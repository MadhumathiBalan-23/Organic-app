/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.js",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontSize: {
        '3xs': ['12px', { lineHeight: '16px' }],
        '2xs': ['13px', { lineHeight: '17px' }],
        'xs': ['14px', { lineHeight: '20px' }],
        'sm': ['15.5px', { lineHeight: '22px' }],
        'base': ['17px', { lineHeight: '24px' }],
        'lg': ['19px', { lineHeight: '26px' }],
        'xl': ['22px', { lineHeight: '28px' }],
        '2xl': ['26px', { lineHeight: '32px' }],
        '3xl': ['32px', { lineHeight: '38px' }],
        '4xl': ['38px', { lineHeight: '46px' }],
      },
      colors: {
        primary: {
          DEFAULT: '#064E3B',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#064E3B',
          900: '#022C22',
        },
        cream: {
          DEFAULT: '#FDFBF7',
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#F6F8F6',
          300: '#F1EFEA',
          400: '#E7E3DA',
        },
        accent: {
          DEFAULT: '#D97706',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
        },
      }
    },
  },
  plugins: [],
};
