/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			sans: ["Sofia Pro", "system-ui", "sans-serif"]
		},
		extend: {
			animation: {
        'rattle': 'rattle 400ms ease-in-out 1',
      },
			colors: {
        'logo-green': '#16697A',
      },
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
