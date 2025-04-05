import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from "astro-icon";
import { remarkReadingTime } from './remark-reading-time.mjs';
import netlify from '@astrojs/netlify';

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
    "/:slug": {
      status: 301,
      destination: "/writing/:slug"
    }
  },
  adapter: netlify()
});