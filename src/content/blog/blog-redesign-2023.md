---
pubDate: 2022-04-06
title: "Redesigning my Blog: 2023"
description: "Just gave my blog a fresh new look for 2023! Switching from SvelteKit to Astro - read on to find out why!"
featured: false
draft: true
---
If you've been here before you might have noticed a few things have changed. That's right, I blew up my blog and rebuilt it from ground up! Two years ago I wrote this line in a [previous blog redesign post](blog-redesign-2021):

> I heard of this new Static site generator, Astro that looks very interesting…
> Nope. Not going down that path.

Well my friend, I moved from [SvelteKit](https://kit.svelte.dev/) to [Astro](https://astro.build/) 😅. On top of a framework change, I also changed my design to embrace minimalism. I wanted to focus on content and nothing else, being heaviy inspired by [Irrational Exuberance](https://lethain.com/). In my previous site, I fell into the trap of spending my energy building features that weren't the core reason of why someone would come to my site. With the stage set, let's talk through some of my thoughts so far on the rewrite:

### Astro & Tailwind
Getting up and running with Astro was a really nice experience. For the first time, I feel like I have a static site generator that is straightforward to use. But offers the additional flexibility to add more reactive features using [Astro islands](https://docs.astro.build/en/concepts/islands/). No shade to SvelteKit though! I loved it but I felt like it was too much for my needs. I'm trying to embrace minimalism in all aspects, including framework features.

I also moved to [Tailwind](https://tailwindcss.com/) for this rewrite and deleted most of my CSS in the process. Tailwind is a utility first CSS framework that allows you to style an element through class names. For example, here's how my links are styled:

```html
<a href="" class="no-underline font-semibold dark:text-teal-400 text-logo-green before:bg-teal-600 before:dark:bg-teal-300 before:rounded-lg hover:before:opacity-100 hover:dark:text-teal-300 hover:text-teal-600 relative">
  Link
</a>
```

Honestly, the upside of not having to maintain my css far outweighs the downside of poor readibility on elements with lots of classes. Getting Astro setup with Tailwind was a breeze with the `@astrojs/tailwind` [integration](https://docs.astro.build/en/guides/integrations-guide/tailwind/).

### URL namespacing
I moved away from the `/garden/<blog-title>` hierarchy and flattened it to `/<blog-title>`. Swyx writes:

> Personal sites of frequent speakers often opt for TWO namespaces: /writing and /speaking. My current site (as of Sept 2020) uses this, but I have grown to dislike it: I will often speak about what I write, and write about related things I speak about. Why separate them? It is more effort to make my talks discoverable to my readers and vice versa.

In his article [*Against Namespacing Personal Sites*](https://www.swyx.io/namespacing-sites). And while I agree with this idea, I tried to overcome that by having a `garden/` namespace. But I'll admit, the naming is horrible. If you don't know what a [digital garden](https://maggieappleton.com/garden-history) is then a `garden/` namespace makes no sense. You can set this up in Astro by adding a `[...slug].astro` file at the root of `src/pages` folder.

### OpenGraph (OG) Images on the fly
Honestly, this is my favourite part of the redesign. I'm using [Netlify Edge functions](https://docs.netlify.com/edge-functions/overview/) to generate OG images on the fly. This image will show up when you share this post on Twitter (or Facebook but who still uses that). Shoutout to Kevin Zuniga Cuellar, whoe wrote about [og images on the edge](https://www.kevinzunigacuellar.com/blog/og-images-on-the-edge/). The annoying parts of building this were:
- Styling was painful because every change you have to re-build the function which equals a lot of time if you're making many small tweaks. Under the hood, ImageResponse library uses Sartori which [takes in most but not all CSS elements](https://github.com/vercel/satori#css).
- You can't access folders with Netlify Edge functions which meant that I can't use custom fonts unless they're loaded on some CDN.

Here's what my edge function looks like:

```javascript
import React from "https://esm.sh/react@18.2.0";
import { ImageResponse } from "https://deno.land/x/og_edge@0.0.2/mod.ts";

const font = fetch("https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfedA.woff")
  .then(
    (res) => res.arrayBuffer(),
  );

export default async function handler(req: Request) {
  const fontData = await font;
  const url = new URL(req.url);
  const params = new URLSearchParams(url.search);
  const title = params.get("title") ?? "How did you get here?";
  const pubDate = params.get("pubDate") ?? new Date().toISOString();

  const parsedDate = new Date(Date.parse(pubDate));

  const formattedDate = parsedDate.toLocaleString('en-US', { month: "long", day: "numeric", year: "numeric"})
   // Generate the open graph image
  return new ImageResponse(
    (<div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        fontFamily: 'Poppins',
        backgroundColor: '#0f172a',
        paddingLeft: 80,
        paddingRight: 30
      }}
      >
        <div
          style={{
            fontSize: 20,
            paddingLeft: 10,
            color: '#f1f5f9',
          }}>{`${formattedDate}  •  Jonathan Yeong`}</div>
        <h1
          style={{
            fontSize: 68,
            background: 'linear-gradient(62deg, #07edaf 0%, #409289 100%)',
            backgroundClip: 'text',
            color: 'transparent',
          }}>{title}</h1>
      </div>),
    {
      fonts: [
        {
          name: 'Poppins',
          data: fontData,
          style: 'normal',
          weight: 900
        }
      ],
    }
  );
}
```

---

I'm trying to get better at building in public so this site is far from finished. I want to focus on content next. Over time, I'll be adding pages for tags, featured and an about page. If you're curious, here's a screenshot of the old homepage. You can still play with the old site [here](https://elastic-engelbart-26e6d9.netlify.app/).

![Old blog homepage](/post_images/redesigning-blog-2023-before-2.png)