import { defineConfig } from 'astro/config';
import db from '@astrojs/db';
// Don't need node since I use netlify adapter
// import node from '@astrojs/node';
import studioCMS from 'studiocms';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from "astro-icon";
import { remarkReadingTime } from './remark-reading-time.mjs';
import netlify from '@astrojs/netlify';
import rehypeExternalLinks from 'rehype-external-links'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.jonathanyeong.com',
  integrations: [
    mdx(),
    sitemap(),
    icon(),
    db(),
    studioCMS(),
  ],
  markdown: {
    drafts: false,
    shikiConfig: {
      themes: {
        dark: 'everforest-dark',
        light: 'everforest-light',
      },
      defaultColor: false
    },
    remarkPlugins: [remarkReadingTime],
    rehypePlugins: [[rehypeExternalLinks, { target: '_blank' }]]
  },
  adapter: netlify()
});