import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'iphone-max': '428px',
        'ipad-portrait': '1024px',
        'ipad-landscape': '1366px',
      },
      colors: {
        obsidian: {
          950: '#070A0F',
          900: '#0B0F17',
          800: '#111827',
          700: '#1E293B',
          600: '#334155',
        },
        cyber: {
          dark: '#0B0F17',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          crimson: '#EF4444',
          violet: '#8B5CF6',
        },
        tone: {
          1: '#06B6D4', // Yinping / High level (Cyber Cyan)
          2: '#F59E0B', // Yangping / Rising (Amber Gold)
          3: '#10B981', // Shangsheng / Dipping (Zen Emerald)
          4: '#EF4444', // Qusheng / Falling (Crimson)
          5: '#94A3B8', // Neutral tone (Muted Slate)
        },
      },
      spacing: {
        'safe-top': 'var(--sat)',
        'safe-bottom': 'var(--sab)',
        'safe-left': 'var(--sal)',
        'safe-right': 'var(--sar)',
      },
    },
  },
  plugins: [],
};

export default config;
