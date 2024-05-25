import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import { remarkReadingTime } from './remark-reading-time.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.jonathanyeong.com',
  integrations: [mdx(), sitemap(), tailwind(), icon()],
  markdown: {
    drafts: false,
    shikiConfig: {
      theme: 'rose-pine-moon'
    },
    remarkPlugins: [remarkReadingTime],
  }
});
