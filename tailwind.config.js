/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          mint: {
            DEFAULT: '#E8F5E9',
            dark: '#A5D6A7',
            deep: '#2E7D32',
          },
          sky: {
            DEFAULT: '#E3F2FD',
            dark: '#90CAF9',
            deep: '#1565C0',
          },
          yellow: {
            DEFAULT: '#FFFDE7',
            dark: '#FFF59D',
            deep: '#F9A825',
          },
          pink: {
            DEFAULT: '#FCE4EC',
            dark: '#F48FB1',
            deep: '#C2185B',
          },
          purple: {
            DEFAULT: '#F3E5F5',
            dark: '#CE93D8',
            deep: '#7B1FA2',
          },
          orange: {
            DEFAULT: '#FFF3E0',
            dark: '#FFCC80',
            deep: '#EF6C00',
          },
        },
      },
    },
  },
  plugins: [],
};
