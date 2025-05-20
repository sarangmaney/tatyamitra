
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

// THIS IS A VERY BASIC IN-MEMORY STORE FOR DEMONSTRATION ONLY.
// DO NOT USE IN PRODUCTION. IT'S NOT SCALABLE AND DATA IS LOST ON SERVER RESTART.
// For production, use a proper database like Firestore with TTL or Redis.
interface OtpStoreEntry {
  otp: string;
  timestamp: number;
  verified: boolean;
}
const otpStore: Record<string, OtpStoreEntry> = {};


const SendOtpSchema = z.object({
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
});

// Simulated list of registered users for demo purposes
const registeredUsers: Record<string, { name: string }> = {
  "1234567890": { name: "Demo User One" },
  "0987654321": { name: "Demo User Two" },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = SendOtpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid phone number.", details: validationResult.error.flatten() }, { status: 400 });
    }

    const { phoneNumber } = validationResult.data;

    // Simulate checking if user exists
    if (!registeredUsers[phoneNumber]) {
      return NextResponse.json({ error: `Phone number +91 ${phoneNumber} is not registered. Please sign up.` }, { status: 404 });
    }

    // Simulate OTP generation (fixed for demo)
    const generatedOtp = "123456"; 
    
    // Store OTP (in-memory, basic)
    otpStore[phoneNumber] = {
      otp: generatedOtp,
      timestamp: Date.now(),
      verified: false,
    };
    console.log(`OTP for ${phoneNumber}: ${generatedOtp} (Stored: ${JSON.stringify(otpStore[phoneNumber])})`);


    // Simulate sending OTP (in a real app, you'd use an SMS gateway)
    // For now, we just log it and return success.
    
    return NextResponse.json({ message: `OTP sent to +91 ${phoneNumber} (simulated). OTP is ${generatedOtp} for testing.` }, { status: 200 });

  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
