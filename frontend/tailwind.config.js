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
        gray: {
          25: '#fafafa',
          50: '#f9fafb',
          100: '#f3f4f6',
        },
        blue: {
          25: '#f8faff',
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        emerald: {
          200: '#a7f3d0',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        green: {
          500: '#22c55e',
          600: '#16a34a',
        },
        red: {
          200: '#fecaca',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        rose: {
          500: '#f43f5e',
          600: '#e11d48',
        }
      },
      height: {
        '15': '3.75rem',
        '16': '4rem',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}