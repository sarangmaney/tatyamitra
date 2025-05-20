
import { type NextRequest, NextResponse } from 'next/server';

/**
 * API route to handle incoming webhook events from the "Tatya" service (or similar).
 * This endpoint should be provided as the callback URL in the external service's webhook settings.
 * 
 * To secure this endpoint, the calling service should be configured to send a secret token
 * in a custom header. This endpoint will then verify that token.
 * 
 * In the external service's webhook configuration:
 * - URL: https://<your-app-domain>/api/webhooks/tatya-events
 * - Headers:
 *   - Key: TATYA_WEBHOOK_SECRET  (This is the HTTP Header Name)
 *   - Value: <your_actual_strong_secret_value> (e.g., aJ7$sP2!qR9&zX0*LpWc)
 * 
 * Environment Variable on Vercel/Server:
 * - TATYA_WEBHOOK_SECRET=<your_actual_strong_secret_value> (The same value as above)
 */

const EXPECTED_WEBHOOK_SECRET_VALUE_FROM_ENV = process.env.TATYA_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  // 1. Verify the secret token
  // The Key from your form ('TATYA_WEBHOOK_SECRET') is the HTTP header name to check.
  const receivedSecretFromHeader = request.headers.get('TATYA_WEBHOOK_SECRET');

  if (!EXPECTED_WEBHOOK_SECRET_VALUE_FROM_ENV) {
    console.error('Webhook secret is not configured in environment variables (TATYA_WEBHOOK_SECRET). Denying all requests.');
    return NextResponse.json({ error: 'Webhook not configured on server' }, { status: 500 });
  }

  if (receivedSecretFromHeader !== EXPECTED_WEBHOOK_SECRET_VALUE_FROM_ENV) {
    console.warn(`Invalid or missing webhook secret in header 'TATYA_WEBHOOK_SECRET'. Request denied. Expected: '${EXPECTED_WEBHOOK_SECRET_VALUE_FROM_ENV}', Received: '${receivedSecretFromHeader}'`);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // If secret is valid, proceed to process the webhook
  try {
    const body = await request.json();
    console.log('Received VERIFIED webhook event (header TATYA_WEBHOOK_SECRET matched):', JSON.stringify(body, null, 2));

    // Process the webhook event here based on its content.
    // For example, if it's an SMS status update:
    // if (body.event === 'sms_delivered') {
    //   // Update your database record for the SMS
    // } else if (body.event === 'sms_failed') {
    //   // Handle SMS failure
    // }

    // It's crucial to respond quickly with a 200 OK to the webhook provider.
    // Actual processing can be done asynchronously if needed.
    return NextResponse.json({ message: 'Webhook received and verified successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing verified webhook:', error);
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
  return NextResponse.json({ message: 'Webhook endpoint is active and expects POST requests with a valid secret in the TATYA_WEBHOOK_SECRET header.' }, { status: 200 });
}
