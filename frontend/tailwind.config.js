/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#34ace0',
          dark: '#156a94',
          light: '#eaf6fc',
        },
        amber: {
          DEFAULT: '#f6a823',
          dark: '#92620a',
        },
        success: { text: '#1a7f4b', bg: '#e6f6ec' },
        warning: { text: '#92620a', bg: '#fdf3df' },
        danger: { text: '#b42318', bg: '#fdecea' },
        ink: {
          DEFAULT: '#1c2733',
          secondary: '#5b6b76',
        },
        surface: {
          border: '#e1edf3',
          page: '#f6fafd',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'fade-in': 'fadeIn 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
