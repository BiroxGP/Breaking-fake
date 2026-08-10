/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        ink: '#0b0d14',
        panel: '#12151f',
        panel2: '#1a1f2e',
        accent: '#ff3b5c',
        accent2: '#00e0d3',
        gold: '#f5b942',
      },
      boxShadow: {
        glow: '0 0 25px rgba(255,59,92,0.35)',
      },
    },
  },
  plugins: [],
};
