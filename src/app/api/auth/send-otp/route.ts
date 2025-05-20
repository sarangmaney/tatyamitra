
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

// This list is no longer a hard gate for sending OTPs but can be used for context.
const preRegisteredUsersForContext: Record<string, { name: string }> = {
  "1234567890": { name: "Demo User One" },
  "0987654321": { name: "Demo User Two" },
  "9595597583": { name: "Previously Added User" },
};

// Helper function to generate a random 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Placeholder function for actual SMS sending
async function sendSmsViaProvider(phoneNumber: string, otp: string): Promise<{success: boolean, messageId?: string, error?: string}> {
  // This is where you would integrate with your chosen SMS provider (e.g., Twilio, Vonage, AWS SNS, MSG91)
  // 1. Install their SDK (e.g., npm install twilio)
  // 2. Configure with API keys/credentials (use environment variables)
  // 3. Construct the message (e.g., `Your OTP for Tatya Mitra is ${otp}`)
  // 4. Make the API call to send the SMS
  // Example (conceptual, not runnable without a provider):
  // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // try {
  //   const message = await client.messages.create({
  //     body: `Your Tatya Mitra OTP is: ${otp}`,
  //     from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
  //     to: `+91${phoneNumber}` // Ensure country code formatting
  //   });
  //   console.log("SMS sent successfully, SID:", message.sid);
  //   return { success: true, messageId: message.sid };
  // } catch (error: any) {
  //   console.error("Failed to send SMS:", error.message);
  //   return { success: false, error: error.message };
  // }

  console.log(`SIMULATING SMS: Sending OTP ${otp} to ${phoneNumber}`);
  // For now, always return success in simulation
  return { success: true };
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = SendOtpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid phone number.", details: validationResult.error.flatten() }, { status: 400 });
    }

    const { phoneNumber } = validationResult.data;

    if (preRegisteredUsersForContext[phoneNumber]) {
      console.log(`Phone number +91 ${phoneNumber} is in the pre-registered context list.`);
    } else {
      console.log(`Phone number +91 ${phoneNumber} is not in the pre-registered context list. Proceeding with OTP generation for any valid number.`);
    }

    const generatedOtp = generateOtp();
    
    // Store OTP (in-memory, basic)
    otpStore[phoneNumber] = {
      otp: generatedOtp,
      timestamp: Date.now(),
      verified: false,
    };
    console.log(`OTP for ${phoneNumber}: ${generatedOtp} (Stored: ${JSON.stringify(otpStore[phoneNumber])})`);

    // Attempt to send SMS via provider
    // In a real scenario, you might not return the OTP in the response if SMS sending is reliable.
    // For this demo, we proceed even if simulated SMS sending had an issue.
    const smsResult = await sendSmsViaProvider(phoneNumber, generatedOtp);

    if (!smsResult.success) {
      // Potentially handle SMS failure, but for now, we'll still allow login with the known OTP for demo purposes
      console.warn(`Failed to send SMS to ${phoneNumber}. Error: ${smsResult.error}. User can still proceed with OTP ${generatedOtp} for testing.`);
       // You might return an error here in a production app if SMS is critical
      // return NextResponse.json({ error: "Failed to send OTP via SMS. Please try again." }, { status: 500 });
    }
    
    // For development/testing, it's helpful to return the OTP in the response.
    // In production, if SMS sending is live, you would NOT return the OTP here.
    return NextResponse.json({ 
      message: `OTP generated for +91 ${phoneNumber}. If SMS sending were live, it would be sent. For testing, OTP is ${generatedOtp}.`,
      otpForTesting: generatedOtp // Remove this line in production
    }, { status: 200 });

  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}

// Helper to make the in-memory store slightly more persistent across HMR in dev
// This is still not for production.
if (typeof global !== 'undefined') {
  // @ts-ignore
  if (!global.otpStoreFromSendOtp) {
    // @ts-ignore
    global.otpStoreFromSendOtp = otpStore;
  } else {
    // If it exists, merge (though simple assignment is fine for this basic store)
    // @ts-ignore
    Object.assign(global.otpStoreFromSendOtp, otpStore[phoneNumber]); // Ensure only the current phone number's OTP is assigned
  }
}
