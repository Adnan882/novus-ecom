/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        midnight: 'rgb(var(--tv-midnight) / <alpha-value>)',
        deep: 'rgb(var(--tv-deep) / <alpha-value>)',
        panel: 'rgb(var(--tv-panel) / <alpha-value>)',
        card: 'rgb(var(--tv-card) / <alpha-value>)',
        line: 'rgb(var(--tv-line) / <alpha-value>)',
        mist: 'rgb(var(--tv-mist) / <alpha-value>)',
        ink: 'rgb(var(--tv-ink) / <alpha-value>)',
        'ink-2': 'rgb(var(--tv-ink-2) / <alpha-value>)',
        glow: 'rgb(var(--tv-glow) / <alpha-value>)',
        'glow-ink': 'rgb(var(--tv-glow-ink) / <alpha-value>)',
        'glow-hover': 'rgb(var(--tv-glow-hover) / <alpha-value>)',
        aqua: 'rgb(var(--tv-aqua) / <alpha-value>)',
        glass: 'var(--tv-glass-bg)',
        mint: '#23d18b',
        ember: '#ff6b6b',
        gold: '#ffd700',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        shine: 'shine 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shine: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}