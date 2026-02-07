/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f7ff',
          100: '#dceaff',
          200: '#b8d6ff',
          300: '#8dbdff',
          400: '#5e9bff',
          500: '#356ff7',
          600: '#1e52db',
          700: '#1a43b2',
          800: '#1a3a8c',
          900: '#1c326f'
        },
        ink: {
          900: '#0c1424',
          800: '#1a2435',
          700: '#28344a',
          600: '#3b4863',
          500: '#4e5d78'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        card: '0 14px 30px -20px rgba(12, 20, 36, 0.35)'
      }
    }
  },
  plugins: []
};
