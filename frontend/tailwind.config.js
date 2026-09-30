/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Poora colour system yahin se badalta hai. Ek jagah change karo, saari site update.
      colors: {
        ink: '#0F1220', // page background
        panel: '#171B2E', // cards / sections
        raised: '#1F2440', // hover / selected surfaces
        line: '#2A3050', // borders
        fg: '#E9E9F2', // main text
        muted: '#9AA0BC', // secondary text
        accent: {
          DEFAULT: '#8F7CFF',
          strong: '#A697FF',
        },
        warn: '#FFB454', // missing / needs attention
        ok: '#5FD3A5', // good / done
        bad: '#FF7A90', // error
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
