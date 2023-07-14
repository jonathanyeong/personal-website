import React from "https://esm.sh/react@18.2.0";
import { ImageResponse } from "https://deno.land/x/og_edge@0.0.2/mod.ts";

// const font = fetch(new URL('../../public/fonts/6080425/6d628111-6a1c-4841-8452-76889dfe2ca2.woff', import.meta.url)).then(res =>
//   res.arrayBuffer()
// );

const font = fetch("https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfedA.woff")
  .then(
    (res) => res.arrayBuffer(),
  );

export default async function handler(req: Request) {
  const fontData = await font;
  // const logo = await svg;
  const url = new URL(req.url);
  const params = new URLSearchParams(url.search);
  const title = params.get("title") ?? "How did you get here?";
  const pubDate = params.get("pubDate") ?? new Date().toISOString();

  const parsedDate = new Date(Date.parse(pubDate));

  const formatDate = (date: Date) => {
    const dateParts = date.toUTCString().split(" ");
    const monthIndex = 2;
    const dayIndex = 1;
    const yearIndex = 3;

    return `${dateParts[monthIndex]} ${dateParts[dayIndex]}, ${dateParts[yearIndex]}`
  }

  const formattedDate = formatDate(parsedDate)
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