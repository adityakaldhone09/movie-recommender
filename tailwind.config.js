/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090D',
        surface: {
          DEFAULT: '#15151D',
          elevated: '#1C1C26',
          border: '#282838',
          hover: '#242434',
        },
        cinema: {
          violet: '#8B5CF6',
          magenta: '#EC4899',
          gold: '#FBBF24',
          text: '#F5F5F7',
          muted: '#A1A1AA',
          subtle: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'cinema-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        'hero-gradient': 'linear-gradient(180deg, rgba(9, 9, 13, 0.2) 0%, rgba(9, 9, 13, 0.8) 60%, #09090D 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(21, 21, 29, 0) 0%, rgba(9, 9, 13, 0.95) 100%)',
      },
      boxShadow: {
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-magenta': '0 0 25px -5px rgba(236, 72, 153, 0.4)',
        'glow-gold': '0 0 20px -5px rgba(251, 191, 36, 0.4)',
        'cinema-card': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

