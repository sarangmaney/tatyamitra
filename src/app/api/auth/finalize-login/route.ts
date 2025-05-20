
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

// Schema for the incoming request from your frontend
const FinalizeLoginRequestSchema = z.object({
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
  // Assuming verificationData from the widget contains an accessToken
  // You might need to adjust this based on the actual structure of MSG91's success callback data
  verificationData: z.object({
    // Example: if the widget directly returns an object like { token: "...", ... }
    // Or, if it's just the token string, then verificationData: z.string()
    // For now, let's assume it's an object and we need to extract a token.
    // Adjust based on MSG91 widget's actual success data structure.
    // A common name for the token might be 'token', 'accessToken', or 'requestId'.
    // Let's assume it's 'token' for this example, and it's what the cURL command calls 'jwt_token_from_otp_widget'
    token: z.string().optional(), // Making it optional to check if it exists
    requestId: z.string().optional(), // MSG91 sometimes uses requestId
    // Add other fields if MSG91 provides them and you need them
  }).or(z.string()), // Allow verificationData to be just the token string itself
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
    // The cURL command refers to it as "jwt_token_from_otp_widget".
    // Let's assume it's passed as `verificationData.token` or `verificationData` itself if it's a string.
    let accessToken: string | undefined;
    if (typeof verificationData === 'string') {
        accessToken = verificationData;
    } else if (verificationData && typeof verificationData === 'object') {
        accessToken = verificationData.token || verificationData.requestId; // Try common keys
    }

    if (!accessToken) {
        console.error("Access token not found in verificationData from widget.", verificationData);
        return NextResponse.json({ error: "Invalid verification data from OTP widget." }, { status: 400 });
    }

    console.log(`Attempting to finalize login for ${phoneNumber} by verifying access token with MSG91.`);

    // Perform the server-to-server call to MSG91 to verify the access token
    const msg91VerifyUrl = 'https://control.msg91.com/api/v5/widget/verifyAccessToken';
    const verifyResponse = await fetch(msg91VerifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authkey: msg91ServerAuthKey,
        'access-token': accessToken, // Field name as per cURL example
      }),
    });

    const verifyResult = await verifyResponse.json();

    // According to some MSG91 docs, a successful response might have type: "success"
    // You MUST check MSG91's API documentation for the exact success/failure response structure.
    if (verifyResponse.ok && verifyResult.type === 'success') {
      // In a real app:
      // 1. Look up the user by phoneNumber in your database.
      // 2. If found (or create if it's a new verified user), create a session token (e.g., JWT for your app).
      // 3. Return the session token to the client.
      console.log(`MSG91 token verification successful for ${phoneNumber}. Session created (simulated). Message: ${verifyResult.message}`);
      return NextResponse.json({ message: "Login successful. Session created (simulated)." }, { status: 200 });
    } else {
      console.warn(`MSG91 token verification failed for ${phoneNumber}. Response from MSG91:`, verifyResult);
      return NextResponse.json({ error: "OTP verification data could not be validated with provider.", details: verifyResult.message || "Unknown error from provider." }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Finalize Login error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
