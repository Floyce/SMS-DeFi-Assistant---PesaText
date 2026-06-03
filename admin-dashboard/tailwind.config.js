/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066CC',
          dark: '#004e9f',
          light: '#dfe8ff',
        },
        secondary: {
          DEFAULT: '#00B4D8',
          dark: '#00677d',
          light: '#b3ebff',
        },
        accent: {
          orange: '#FF6B35',
          DEFAULT: '#FF6B35',
        },
        'stellar-gold': '#FDDA24',
        'surface-gray': '#F4F4F4',
        background: '#fbf9f8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
      }
    },
  },
  plugins: [],
}
