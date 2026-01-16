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
        'neon-green': '#00FF41',
        'neon-purple': '#8B5CF6',
        'off-white': '#F8F7F4',
        'dark': '#1A1A1A',
      },
      fontFamily: {
        mono: ['var(--font-mono)'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}