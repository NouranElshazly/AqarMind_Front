/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {},
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'modal-appear': 'modal-appear 0.5s ease-out forwards',
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
        'float': 'float linear infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
      },
      keyframes: {
        'modal-appear': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.8) translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)'
          }
        },
        'bounce-slow': {
          '0%, 100%': {
            transform: 'translateY(0)'
          },
          '50%': {
            transform: 'translateY(-10px)'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(120deg)' },
          '66%': { transform: 'translateY(10px) rotate(240deg)' }
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' }
        }
      },
      colors: {
        light: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          accent: '#e2e8f0',
          text: {
            primary: '#1e293b',
            secondary: '#64748b',
            accent: '#475569'
          }
        },
        dark: {
          primary: '#0f172a',
          secondary: '#1e293b',
          accent: '#334155',
          text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
            accent: '#cbd5e1'
          }
        }
      }
    },
  },
  plugins: [],
}