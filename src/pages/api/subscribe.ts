import type { APIRoute } from 'astro'
import { ghostClient } from '@lib/api/ghostAdmin'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const name = formData.get("name");

  if (!email || typeof email !== 'string') {
    return new Response(
      JSON.stringify({
        message: "Email is required",
      }),
      { status: 400 }
    );
  }

  if (!name || typeof name !== 'string') {
    return new Response(
      JSON.stringify({
        message: "Name is required",
      }),
      { status: 400 }
    );
  }

  try {
    await ghostClient.members.add({ email, name });

    return new Response(
      JSON.stringify({
        message: "Success! Check your email to confirm!"
      }),
      { status: 200 }
    );
  } catch (error: unknown) {
    const ghostError = error as { message?: string; context?: string };
    const errorMessage = ghostError.message || '';

    // Handle duplicate member
    if (errorMessage.includes('Member already exists')) {
      return new Response(
        JSON.stringify({
          message: "You're already subscribed!"
        }),
        { status: 200 }
      );
    }

    // Handle validation errors
    if (errorMessage.includes('validation') || errorMessage.includes('Invalid')) {
      return new Response(
        JSON.stringify({
          message: errorMessage
        }),
        { status: 400 }
      );
    }

    console.error('Newsletter subscription error:', error);
    return new Response(
      JSON.stringify({
        message: "Failed to subscribe. Please try again later."
      }),
      { status: 500 }
    );
  }
}