/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#118C8C',
        'primary-light': '#14a8a8',
        accent: '#00cfcf',
        highlight: '#118C8C',
        fonatur: {
          beige: '#F2E9D8',
          red: '#e6281aff',
        },
      },
      boxShadow: {
        'custom': '0 10px 30px rgba(17, 140, 140, 0.1)',
      },
      backdropBlur: {
        'custom': '10px',
      },
    },
  },
  plugins: [],
}
