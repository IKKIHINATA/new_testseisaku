// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
      ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
      colors: {
        'tokium-green': '#008D97',
        'light-green': '#00CC99',
        'orange': '#F98938',
        'text-black': '#222229',
        'gray-bg': '#F6F6F6',
        'pale-blue-bg': '#EDF7F8',
      }
    },
  },
  plugins: [],
}