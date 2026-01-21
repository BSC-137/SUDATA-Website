/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        sudata: {
          navy: '#020617',
          cyan: '#22d3ee',
          grey: '#94a3b8',
          neon: '#00F0FF',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        retro: ['"VT323"', 'monospace'],
      },
    },
  },
  plugins: [],
}

