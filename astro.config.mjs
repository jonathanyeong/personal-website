import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from "astro-icon";
import { remarkReadingTime } from './remark-reading-time.mjs';
import netlify from '@astrojs/netlify';
import rehypeExternalLinks from 'rehype-external-links'
import sanity from '@sanity/astro';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.jonathanyeong.com',
  integrations: [
    mdx(),
    sitemap(),
    icon(),
    sanity({
      projectId: 'dj97ssl8',
      dataset: 'blog-posts',
      useCdn: false, // See note on using the CDN
      apiVersion: "2025-11-19", // insert the current date to access the latest version of the API
      studioBasePath: '/studio' // If you want to access the Studio on a route
    }),
    react()],
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