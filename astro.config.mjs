import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from "astro-icon";
import { remarkReadingTime } from './remark-reading-time.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.jonathanyeong.com',
  integrations: [mdx(), sitemap(), icon()],
  markdown: {
    drafts: false,
    shikiConfig: {
      themes: {
        dark: 'everforest-dark',
        light: 'everforest-light'
      }
    },
    remarkPlugins: [remarkReadingTime],
  },
  redirects: {
    "/about": "/#aboutme",
    "/:slug": {
      status: 301,
      destination: "/writing/:slug"
    }
  }
});
