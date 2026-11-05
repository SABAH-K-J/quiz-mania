/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#15161a',
          950: '#0e0f12',
          900: '#15161a',
          800: '#22252b',
          700: '#343941',
          600: '#4a505a',
          500: '#626a75',
          400: '#8a919b',
          300: '#b4bac2',
          200: '#d2d6db',
          100: '#e7e9ec',
        },
        arena: {
          DEFAULT: '#f2f0e9',
          50: '#faf9f4',
          100: '#f2f0e9',
          200: '#e7e4da',
          300: '#d8d4c7',
          400: '#c4bfaf',
        },
        signal: {
          red: '#e4262c',
          'red-dark': '#b71b20',
          'red-soft': '#fde8e8',
          blue: '#1746d1',
          'blue-dark': '#0f2f94',
          'blue-soft': '#e6ecfc',
          yellow: '#f5c400',
          'yellow-dark': '#c79e00',
          'yellow-soft': '#fff6cc',
          green: '#0e7a4a',
          'green-soft': '#e3f5eb',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
        body: ['"Barlow"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(21,22,26,0.08), 0 10px 24px -18px rgba(21,22,26,0.55)',
        lift: '0 2px 0 rgba(21,22,26,0.12), 0 14px 32px -20px rgba(21,22,26,0.6)',
      },
      animation: {
        'lamp': 'lamp 2.4s steps(1, end) infinite',
        'digit-in': 'digitIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
        'rail-out': 'railOut 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        lamp: {
          '0%, 70%, 100%': { opacity: '1' },
          '72%, 88%': { opacity: '0.35' },
        },
        digitIn: {
          '0%': { opacity: '0', transform: 'translateY(0.45em)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        railOut: {
          '0%': { transform: 'scaleX(1)' },
          '100%': { transform: 'scaleX(0)' },
        },
      },
    },
  },
  plugins: [],
}
