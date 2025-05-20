
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

// THIS IS A SIMULATION. Replace with actual session management and potentially final verification with provider.

const FinalizeLoginSchema = z.object({
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
  verificationData: z.any(), // This will be the data from the MSG91 widget's success callback
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = FinalizeLoginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid input.", details: validationResult.error.flatten() }, { status: 400 });
    }

    const { phoneNumber, verificationData } = validationResult.data;

    console.log(`Attempting to finalize login for ${phoneNumber} with verification data:`, verificationData);

    // SIMULATE: Verifying the 'verificationData' (e.g., a request_id or session_id from MSG91)
    // Some providers might require you to make one final server-to-server call to confirm the OTP verification.
    // Others might consider the data from the widget's success callback as sufficient proof if the initial tokenAuth was secure.
    // Refer to your SMS provider's documentation.
    
    // For this demo, we'll assume the data from the widget is trusted (because the tokenAuth flow was secure).
    const isVerified = true; // Simulate successful verification

    if (isVerified) {
      // In a real app:
      // 1. Look up the user by phoneNumber in your database.
      // 2. If found, create a session token (e.g., JWT).
      // 3. Return the session token to the client.
      console.log(`Login finalized successfully for ${phoneNumber}.`);
      return NextResponse.json({ message: "Login successful. Session created (simulated)." }, { status: 200 });
    } else {
      console.warn(`Login finalization failed for ${phoneNumber}.`);
      return NextResponse.json({ error: "OTP verification data could not be validated." }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Finalize Login error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
