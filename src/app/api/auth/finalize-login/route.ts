
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

// Schema for the incoming request from your frontend
// IMPORTANT: Adjust verificationData structure based on MSG91 widget's actual success callback data.
const FinalizeLoginRequestSchema = z.object({
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
  verificationData: z.object({
    // Example: if the widget directly returns an object like { token: "...", requestId: "..." }
    // Common names for the token might be 'token', 'accessToken', 'requestId', or other specific names from MSG91.
    // This token is what the cURL command refers to as "jwt_token_from_otp_widget".
    // Check MSG91 widget success callback documentation for the exact field name.
    token: z.string().optional(), 
    requestId: z.string().optional(), 
    // Add other fields if MSG91 provides them and you need them for verification
  }).or(z.string()).describe("The data object or token string received from the MSG91 widget's success callback."), 
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = FinalizeLoginRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid input.", details: validationResult.error.flatten() }, { status: 400 });
    }

    const { phoneNumber, verificationData } = validationResult.data;
    const msg91ServerAuthKey = process.env.MSG91_SERVER_AUTH_KEY;

    if (!msg91ServerAuthKey) {
      console.error("MSG91_SERVER_AUTH_KEY is not configured in environment variables.");
      return NextResponse.json({ error: "Authentication service is not configured on the server." }, { status: 500 });
    }

    // Extract the access token from verificationData
    // This depends on how the MSG91 widget returns the success data.
    let accessToken: string | undefined;
    if (typeof verificationData === 'string') {
        accessToken = verificationData;
    } else if (verificationData && typeof verificationData === 'object') {
        // Check common keys. PRIORITIZE what MSG91's documentation says for the 'verifyAccessToken' endpoint
        // and what the widget's success callback actually provides.
        accessToken = verificationData.token || verificationData.requestId; // Adjust if MSG91 widget uses different field names
    }

    if (!accessToken) {
        console.error("Access token not found in verificationData from widget. Received data:", verificationData);
        return NextResponse.json({ error: "Invalid verification data from OTP widget. Access token missing." }, { status: 400 });
    }

    console.log(`Attempting to finalize login for ${phoneNumber} by verifying access token with MSG91.`);

    // =====================================================================================
    // VERIFY THIS API CALL STRUCTURE WITH MSG91 DOCUMENTATION FOR 'verifyAccessToken'
    // 1. Confirm the endpoint URL: Is 'https://control.msg91.com/api/v5/widget/verifyAccessToken' correct?
    // 2. Confirm Request Method: Is it POST?
    // 3. Confirm Headers: Is 'Content-Type: application/json' sufficient?
    // 4. Confirm Body Structure:
    //    - Does it require 'authkey'?
    //    - What is the EXACT field name for the token from the widget? The cURL example uses 'access-token'. Ensure this matches.
    // =====================================================================================
    const msg91VerifyUrl = 'https://control.msg91.com/api/v5/widget/verifyAccessToken';
    const verifyResponse = await fetch(msg91VerifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authkey: msg91ServerAuthKey,
        'access-token': accessToken, // VERIFY THIS FIELD NAME with MSG91 docs for this endpoint
        // Ensure no other required fields are missing for this MSG91 endpoint
      }),
    });

    const verifyResult = await verifyResponse.json();

    // =====================================================================================
    // VERIFY MSG91 SUCCESS/FAILURE RESPONSE STRUCTURE for the `verifyAccessToken` endpoint.
    // 1. How does MSG91 indicate a successful verification in the JSON response? 
    //    The example checks `verifyResult.type === 'success'`. This might vary (e.g., status code, specific field values).
    // 2. How does MSG91 indicate a failure? What does the error object look like?
    // =====================================================================================
    if (verifyResponse.ok && verifyResult.type === 'success') { // Adjust this condition based on MSG91 docs
      // In a real app:
      // 1. Look up the user by phoneNumber in your database (or create if new and verified).
      // 2. Create a session token (e.g., JWT for your Tatya Mitra app).
      // 3. Return your app's session token to the client.
      console.log(`MSG91 token verification successful for ${phoneNumber}. Session created (simulated). Message: ${verifyResult.message}`);
      return NextResponse.json({ message: "Login successful. Session created (simulated)." }, { status: 200 });
    } else {
      console.warn(`MSG91 token verification failed for ${phoneNumber}. Status: ${verifyResponse.status}, Response from MSG91:`, verifyResult);
      return NextResponse.json({ error: "OTP verification data could not be validated with provider.", details: verifyResult.message || "Unknown error from provider." }, { status: verifyResponse.status || 400 });
    }

  } catch (error: any) {
    console.error("Finalize Login error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
