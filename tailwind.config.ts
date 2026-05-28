import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['var(--font-bebas)'],
        dm: ['var(--font-dm-sans)'],
        serif: ['var(--font-dm-serif)'],
      },
      colors: {
        gold: {
          DEFAULT: '#D4A843',
          light: '#F0C96A',
          dark: '#B8882A',
          dim: 'rgba(212,168,67,0.15)',
        },
        dark: {
          DEFAULT: '#120D03',
          2: '#1A1205',
          3: '#1F1608',
        },
      },
    },
  },
  plugins: [],
}

export default config