/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#fa5e59',
        secondary: '#77d6CF',
        tertiary: '#fe6a60',
        accent: '#77d6CF',
        highlight: '#fe6a60',
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
