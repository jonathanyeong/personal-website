/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    fontFamily: {
      sans: ["Sofia Pro", "system-ui", "sans-serif"]
    },
    extend: {
      colors: {
        'logo-green': '#16697A',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
