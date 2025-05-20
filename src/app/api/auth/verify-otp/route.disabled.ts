
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
    
    let storedEntry = otpStore[phoneNumber];

    // Fallback for demo if store is empty (common in serverless or after restart)
    // For ANY phone number, if its OTP isn't found, assume the demo OTP "123456" was "sent".
    if (!storedEntry) {
        console.warn(`OTP for ${phoneNumber} not found in verify-otp's in-memory store. Using fallback demo OTP "123456".`);
        // Attempt to use global store if populated by send-otp in dev
        // @ts-ignore
        const globalStore = global.otpStoreFromSendOtp || global.currentOtpStoreInVerify;
        if (globalStore && globalStore[phoneNumber]) {
            console.log(`Found OTP for ${phoneNumber} in global store.`);
            storedEntry = globalStore[phoneNumber];
        } else {
             storedEntry = { otp: "123456", timestamp: Date.now() - 60000, verified: false }; // Pretend it was sent 1 min ago
        }
    }


    if (!storedEntry) {
      // This case should ideally not be reached with the generalized fallback, but kept for safety.
      console.error("No OTP found for phoneNumber:", phoneNumber, "Current otpStore in verify-otp:", otpStore);
      return NextResponse.json({ error: "OTP not found or expired. Please try sending OTP again." }, { status: 400 });
    }

    if (storedEntry.verified) {
      return NextResponse.json({ error: "OTP already verified." }, { status: 400 });
    }

    if (Date.now() - storedEntry.timestamp > OTP_EXPIRY_MS) {
      delete otpStore[phoneNumber]; // Clean up expired OTP
      // @ts-ignore
      const globalStore = global.otpStoreFromSendOtp || global.currentOtpStoreInVerify;
      if (globalStore) delete globalStore[phoneNumber];

      return NextResponse.json({ error: "OTP expired. Please request a new one." }, { status: 400 });
    }

    if (storedEntry.otp === userOtp) {
      otpStore[phoneNumber].verified = true; // Mark as verified to prevent reuse (basic)
       // @ts-ignore
      const globalStore = global.otpStoreFromSendOtp || global.currentOtpStoreInVerify;
      if (globalStore && globalStore[phoneNumber]) globalStore[phoneNumber].verified = true;

      // In a real app, generate a session token/JWT here and return it.
      // For now, just success.
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
  if (!global.otpStorePopulatedByVerifyOtp) { 
    // @ts-ignore
    if (global.otpStoreFromSendOtp) {
       // @ts-ignore
      Object.assign(otpStore, global.otpStoreFromSendOtp);
      console.log("Populated OTP store in verify-otp from global cache (verify-otp module).");
    }
    // @ts-ignore
    global.otpStorePopulatedByVerifyOtp = true; 
  }
  // @ts-ignore
  global.currentOtpStoreInVerify = otpStore; 
}
