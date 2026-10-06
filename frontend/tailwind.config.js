/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
      },
      colors: {
        'restro-green-light': 'var(--restro-green-light)',
        'restro-green': 'var(--restro-green)',
        'restro-green-10': 'var(--restro-green-10)',
        'restro-border-green': 'var(--restro-border-green)',
        'restro-text': 'var(--restro-text)',
        'restro-gray': 'var(--restro-gray)',
        'restro-ring': 'var(--restro-ring)',
        'restro-bg-gray': 'var(--restro-bg-gray)',
        'restro-card-bg': 'var(--restro-card-bg)',
        'restro-button-hover': 'var(--restro-button-hover)',
        'restro-green-button-hover': 'var(--restro-green-button-hover)',
        'restro-red': 'var(--restro-red)',
        'restro-bg-red': 'var(--restro-bg-red)',
        'restro-red-hover': 'var(--restro-red-hover)',
        'restro-yellow': 'var(--restro-yellow)',
        'restro-bg-yellow': 'var(--restro-bg-yellow)',
        'restro-yellow-hover': 'var(--restro-yellow-hover)',
        'restro-checkbox': 'var(--restro-checkbox)',

        'background': 'var(--background)',
        'foreground': 'var(--foreground)',

        'restro-green-dark': "var(--restro-green-dark, #0F172A)",
        'restro-border-green-light': "var(--restro-border-green-light, #CBD5E1)",
        'restro-superadmin-widget-bg': "var(--restro-superadmin-widget-bg, #1E3A8A)",
        'restro-superadmin-text-green': "var(--restro-superadmin-text-green, #2563EB)",
        'restro-superadmin-text-black': "var(--restro-superadmin-text-black, #1E293B)",

        // Dark theme colors
        'restro-green-dark-mode': "#1E3A8A",
        'restro-border-dark-mode': '#334155',
        'restro-text-dark-mode': '#F8FAFC',
        'restro-bg-seconday-dark-mode': '#1E293B',
        'restro-gray-dark-mode': '#0F172A',
        'restro-bg-card-dark-mode': '#1E293B',
        'restro-card-border-dark-mode': '#334155',
        'restro-card-iconbg': '#1E293B',
        'restro-bg-hover-dark-mode': '#334155',
        'restro-bg-button-dark-mode': '#1E3A8A',
        'restro-placeholder-outline-dark-mode': '#64748B',

        // Light theme colors
        'restro-border-light-mode': '#CBD5E1',
        'restro-text-light-mode': '#475569',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
      }
    },
  },
  plugins: [require("daisyui"), require('tailwind-scrollbar')],
  daisyui: {
    themes: ["light", "black"],
    darkTheme: "black",
  }
}
