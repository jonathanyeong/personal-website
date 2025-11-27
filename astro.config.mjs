import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from "astro-icon";
import { remarkReadingTime } from './remark-reading-time.mjs';
import netlify from '@astrojs/netlify';
import rehypeExternalLinks from 'rehype-external-links';
import { shikiThemes, shikiDefaultColor } from './shiki.config.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.jonathanyeong.com',
  integrations: [mdx(), sitemap(), icon()],
  markdown: {
    drafts: false,
    shikiConfig: {
      themes: shikiThemes,
      defaultColor: shikiDefaultColor
    },
    remarkPlugins: [remarkReadingTime],
    rehypePlugins: [[rehypeExternalLinks, { target: '_blank' }]]
  },
  adapter: netlify()
});