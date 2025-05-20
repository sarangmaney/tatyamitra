
import { type NextRequest, NextResponse } from 'next/server';

/**
 * API route to handle incoming webhook events from the "Tatya" service (or similar).
 * This endpoint should be provided as the callback URL in the external service's webhook settings.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received webhook event:', JSON.stringify(body, null, 2));

    // Process the webhook event here based on its content.
    // For example, if it's an SMS status update:
    // if (body.event === 'sms_delivered') {
    //   // Update your database record for the SMS
    // } else if (body.event === 'sms_failed') {
    //   // Handle SMS failure
    // }

    // It's crucial to respond quickly with a 200 OK to the webhook provider.
    // Actual processing can be done asynchronously if needed.
    return NextResponse.json({ message: 'Webhook received successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    // Return an error status if something goes wrong during initial processing (e.g., JSON parsing)
    // Be careful not to return 5xx for issues in your async processing,
    // as the provider might retry excessively.
    return NextResponse.json({ error: 'Failed to process webhook', details: error.message }, { status: 400 });
  }
}

// Optional: You might want a GET handler for verification if the provider requires it.
// Some services do a GET request to your webhook URL first to verify it's reachable.
export async function GET(request: NextRequest) {
  // Logic for verification if needed by the provider.
  // Often involves returning a specific challenge token.
  // Check the provider's documentation.
  return NextResponse.json({ message: 'Webhook endpoint is active. Ready for POST requests.' }, { status: 200 });
}
