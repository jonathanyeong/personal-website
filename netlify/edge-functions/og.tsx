import React from "https://esm.sh/react@18.2.0";
import { ImageResponse } from "https://deno.land/x/og_edge@0.0.2/mod.ts";

const font = fetch(new URL('../../public/fonts/6080425/6d628111-6a1c-4841-8452-76889dfe2ca2.woff', import.meta.url)).then(res =>
  res.arrayBuffer()
);

export default async function handler(req: Request) {
  const fontData = await font;
  // const logo = await svg;
  const url = new URL(req.url);
  const params = new URLSearchParams(url.search);
  const title = params.get("title") ?? "How did you get here?";
  const pubDate = params.get("pubDate") ?? new Date().toISOString();;

   // Generate the open graph image
  return new ImageResponse(
    (<div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 80,
        fontFamily: 'Sofia Pro',
        color: '#F8FAFC',
        backgroundColor: '#325164',
        backgroundImage: 'linear-gradient(62deg, #325164 0%, #409289 100%)',
      }}
      >
        <div>{title.toUpperCase()}</div>
        <div>{pubDate}</div>
      </div>),
    {
      fonts: [
        {
          name: 'Sofia Pro',
          data: fontData,
          style: 'normal',
          weight: 900
        }
      ]
    }
  );
}