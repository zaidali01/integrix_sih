/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#F4EFE4',
        panel: '#FBF9F3',
        border: 'rgba(28,26,22,0.28)',
        borderStrong: 'rgba(28,26,22,0.55)',
        paper: '#1C1A16',
        muted: '#847E70',
        accent: '#C89B3C',
        accentDim: 'rgba(200,155,60,0.10)',
        danger: '#A8462F',
        success: '#5B7A5B',
      },
      fontFamily: {
        display: ['"Libre Franklin"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        serif: ['"Source Serif 4"', 'serif'],
      },
      borderRadius: {
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
      },
    },
  },
  plugins: [],
}