/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bili: {
          pink: '#FB7299',
          blue: '#00AEEC',
          ink: '#0B1220',
          bg: '#F7F9FC',
        },
      },
      boxShadow: {
        bili: '0 12px 30px rgba(11, 18, 32, 0.10)',
        biliHover: '0 18px 45px rgba(251, 114, 153, 0.18)',
      },
    },
  },
  plugins: [],
}
