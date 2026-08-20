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
          DEFAULT: '#004ac6',
          container: '#2563eb',
        },
        surface: {
          DEFAULT: '#f8f9fb',
          dim: '#d9dadc',
        }
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
