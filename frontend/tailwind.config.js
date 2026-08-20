/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F9FAFB', // very soft gray
        surface: '#FFFFFF',
        primary: '#475569', // muted slate blue/gray
        'primary-hover': '#334155',
        text: {
          main: '#1E293B',
          muted: '#64748B'
        },
        border: '#E2E8F0',
        attendance: {
          present: '#22c55e', // standard green
          absent: '#ef4444', // standard red
        }
      }
    },
  },
  plugins: [],
}
