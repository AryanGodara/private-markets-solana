/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'shadow-dark': '#0a0a0a',
        'shadow-primary': '#7c3aed',
        'shadow-secondary': '#1e1b4b',
        'privacy-green': '#10b981',
        'privacy-red': '#ef4444',
      },
      fontFamily: {
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
}