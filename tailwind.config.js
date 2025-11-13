/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          100: '#F8FAFC',
          200: '#E2E8F0',
          300: '#94A3B8',
          400: '#64748B',
          500: '#475569',
          600: '#334155',
          700: '#1E293B',
          800: '#0F172A',
          900: '#020617'
        },
        accent: {
          cyan: '#22D3EE',
          blue: '#3B82F6',
          emerald: '#10B981'
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
