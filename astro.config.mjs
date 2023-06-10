import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://www.jonathanyeong.com',
  integrations: [mdx(), sitemap(), tailwind()],
  experimental: {
    assets: true
  },
  markdown: {
    drafts: false,
    shikiConfig: {
      theme: 'rose-pine-moon'
    }
  }
});