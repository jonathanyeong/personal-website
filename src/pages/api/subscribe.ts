
import type { APIRoute } from 'astro'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");

  if (!email) {
    return new Response(
      JSON.stringify({
        message: "Missing required fields",
      }),
      { status: 400 }
    );
  }

  const beehiivUrl = `https://api.beehiiv.com/v2/publications/${import.meta.env.BEEHIIV_PUBLICATION_ID}/subscriptions`
  const response = await fetch(beehiivUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.BEEHIIV_API_KEY}`
    },
    body: JSON.stringify({ email, referring_site: "jonathanyeong.com" }),
  });

  const { data } = await response.json()
  const { status } = data

  // The status of the subscription.
  // validating - The email address is being validated.
  // invalid - The email address is invalid.
  // pending - The email address is valid, but the subscription is pending double opt-in.
  // active - The email was valid and the subscription is active.
  // inactive - The subscription was made inactive, possibly due to an unsubscribe.
  // needs_attention - The subscription requires approval or denial.
  let respBody: string = JSON.stringify({
    message: "Success! Check your email to confirm!"
  });

  if (status == "invalid") {
    respBody = JSON.stringify({
      message: "Invalid email"
    });
  }

  if (status == "active") {
    respBody = JSON.stringify({
      message: "You're already subscribed 🙌!"
    });
  }

  return new Response(
    respBody,
    { status: 200 }
  );
}