
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

// THIS IS A VERY BASIC IN-MEMORY STORE FOR DEMONSTRATION ONLY.
// DO NOT USE IN PRODUCTION. IT'S NOT SCALABLE AND DATA IS LOST ON SERVER RESTART.
// It should be the same instance as in send-otp/route.ts for this to work in a dev server context.
// However, in a serverless environment, each invocation is separate.
// This highlights why a proper external store (Redis, Firestore with TTL) is needed.
interface OtpStoreEntry {
  otp: string;
  timestamp: number;
  verified: boolean;
}
const otpStore: Record<string, OtpStoreEntry> = {}; // This will be a separate instance from send-otp if deployed serverlessly.


const VerifyOtpSchema = z.object({
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
  otp: z.string().min(4, "OTP must be at least 4 digits.").max(6, "OTP cannot exceed 6 digits."),
});

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = VerifyOtpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid input.", details: validationResult.error.flatten() }, { status: 400 });
    }

    const { phoneNumber, otp: userOtp } = validationResult.data;

    // Retrieve stored OTP
    // CRITICAL NOTE for this simulation:
    // The otpStore here will LIKELY BE EMPTY unless the send-otp and verify-otp
    // requests are handled by the SAME server process instance without restart.
    // This is a common issue with in-memory stores in serverless environments.
    // For a true test, the send-otp would need to communicate the OTP to verify-otp
    // (e.g., by returning it in dev mode, or using a shared DB).
    // For this exercise, we'll assume send-otp wrote to this *exact* otpStore instance if running locally.
    // If it's not found, we'll use a fallback for the demo OTP for "1234567890".
    
    let storedEntry = otpStore[phoneNumber];

    // Fallback for demo if store is empty (common in serverless or after restart)
    if (!storedEntry && phoneNumber === "1234567890") {
        console.warn(`OTP for ${phoneNumber} not found in verify-otp's in-memory store. Using fallback demo OTP.`);
        storedEntry = { otp: "123456", timestamp: Date.now() - 60000, verified: false }; // Pretend it was sent 1 min ago
    } else if (!storedEntry && phoneNumber === "0987654321") {
        console.warn(`OTP for ${phoneNumber} not found in verify-otp's in-memory store. Using fallback demo OTP.`);
        storedEntry = { otp: "123456", timestamp: Date.now() - 60000, verified: false };
    }


    if (!storedEntry) {
      console.error("No OTP found for phoneNumber:", phoneNumber, "Current otpStore in verify-otp:", otpStore);
      return NextResponse.json({ error: "OTP not found or expired. Please try sending OTP again." }, { status: 400 });
    }

    if (storedEntry.verified) {
      return NextResponse.json({ error: "OTP already verified." }, { status: 400 });
    }

    if (Date.now() - storedEntry.timestamp > OTP_EXPIRY_MS) {
      delete otpStore[phoneNumber]; // Clean up expired OTP
      return NextResponse.json({ error: "OTP expired. Please request a new one." }, { status: 400 });
    }

    if (storedEntry.otp === userOtp) {
      otpStore[phoneNumber].verified = true; // Mark as verified to prevent reuse (basic)
      // In a real app, generate a session token/JWT here and return it.
      // For now, just success.
      // Consider deleting otpStore[phoneNumber] after successful verification too.
      return NextResponse.json({ message: "OTP verified successfully. Login successful." }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}

// Helper to populate the verify-otp store if send-otp wrote to a different instance
// This is purely for making the demo work better.
if (typeof global !== 'undefined') {
  // @ts-ignore
  if (!global.otpStorePopulated) {
    // @ts-ignore
    if (global.otpStoreFromSendOtp) {
       // @ts-ignore
      Object.assign(otpStore, global.otpStoreFromSendOtp);
      console.log("Populated OTP store in verify-otp from global cache.");
    }
    // @ts-ignore
    global.otpStorePopulated = true;
  }
  // @ts-ignore
  global.currentOtpStoreInVerify = otpStore; 
}
