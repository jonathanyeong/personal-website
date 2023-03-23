import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  // site: 'https://www.jonathanyeong.com',
  site: 'https://brilliant-moonbeam-1e2ea1.netlify.app',
  integrations: [mdx(), sitemap(), tailwind()],
  markdown: {
    drafts: false,
    shikiConfig: {
      theme: 'rose-pine-moon',
    }
  }
});