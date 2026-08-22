/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Emergency Colors
        emergency: {
          critical: '#DC2626', // Red-600
          high: '#EA580C',     // Orange-600
          medium: '#CA8A04',   // Yellow-600
          moderate: '#84CC16', // Lime-500
          low: '#16A34A',      // Green-600
          normal: '#0891B2',   // Cyan-600
        },
        // Brand & Water Theme
        brand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
        },
        // UI & Slate Colors
        surface: {
          light: '#FFFFFF',
          dark: '#0F172A',
          card: '#1E293B',
          subtle: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Oriya', 'Noto Sans Devanagari', 'Kalinga', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Noto Sans Oriya', 'Noto Sans Devanagari', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-ping': 'radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'wave': 'wave 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        radarPing: {
          '75%, 100%': {
            transform: 'scale(2.4)',
            opacity: '0',
          },
        },
        wave: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(220, 38, 38, 0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(220, 38, 38, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
