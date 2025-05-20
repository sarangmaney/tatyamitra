
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

const InitiateOtpSessionSchema = z.object({
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = InitiateOtpSessionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid phone number.", details: validationResult.error.flatten() }, { status: 400 });
    }

    const { phoneNumber } = validationResult.data;
    const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID; 
    const serverAuthKey = process.env.MSG91_SERVER_AUTH_KEY;

    if (!widgetId) {
        console.error("NEXT_PUBLIC_MSG91_WIDGET_ID is not configured in environment variables.");
        return NextResponse.json({ error: "OTP service client configuration is missing on the server." }, { status: 500 });
    }
    if (!serverAuthKey) {
        console.error("MSG91_SERVER_AUTH_KEY is not configured in environment variables. This is a very likely cause of AuthenticationFailure.");
        return NextResponse.json({ error: "OTP service authentication is missing on the server. Potential cause of AuthenticationFailure." }, { status: 500 });
    }

    console.log(`Attempting to initiate OTP session for ${phoneNumber} using widget ID: ${widgetId} and serverAuthKey (first 5 chars): ${serverAuthKey.substring(0,5)}...`);

    // =====================================================================================
    // TODO: ACTUAL CALL TO MSG91 (or your provider's) SERVER-SIDE API TO GET A tokenAuth
    // This tokenAuth is what the client-side widget needs for initialization.
    // Consult MSG91 documentation for the correct endpoint and parameters.
    // It will likely involve sending your serverAuthKey, the phoneNumber, and possibly the widgetId.
    //
    // If you are seeing "AuthenticationFailure":
    // 1. VERIFY `MSG91_SERVER_AUTH_KEY` is correct, active, and whitelisted for your server's IP if IP security is ON for the key.
    // 2. VERIFY `NEXT_PUBLIC_MSG91_WIDGET_ID` is correct for the widget you configured on MSG91.
    // 3. VERIFY the MSG91 API endpoint URL and request body structure below are 100% correct as per MSG91 documentation.
    //    (The example fetch below is a GUESS and needs to be confirmed with MSG91 docs)
    // 4. CHECK your MSG91 account for any issues (balance, activation status).
    // =====================================================================================
    
    // Example structure of calling an MSG91 API endpoint (REPLACE WITH ACTUAL FROM MSG91 DOCS)
    // const MSG91_INITIATE_ENDPOINT = 'https://control.msg91.com/api/v5/SOMETHING_LIKE_INITIATE_WIDGET_SESSION_OR_GET_TOKENAUTH';
    // try {
    //   const providerResponse = await fetch(MSG91_INITIATE_ENDPOINT, {
    //     method: 'POST', // Or GET, depending on MSG91 docs
    //     headers: {
    //       'Content-Type': 'application/json',
    //       // 'authkey': serverAuthKey, // Some MSG91 APIs take authkey in header, some in body. CHECK DOCS.
    //     },
    //     body: JSON.stringify({
    //       authkey: serverAuthKey, // Often authkey is part of the body for MSG91
    //       mobile: phoneNumber,    // Or whatever parameter name MSG91 expects for phone number
    //       widget_id: widgetId,    // Or similar parameter for widget ID
    //       // Potentially other parameters like 'otp_length', 'otp_expiry' if not handled by widget config alone
    //     }),
    //   });

    //   const providerData = await providerResponse.json();

    //   if (!providerResponse.ok) {
    //     // If MSG91 returns an error (like AuthenticationFailure), providerData.message might contain it.
    //     console.error(`Failed to initiate OTP with provider for ${phoneNumber}. Status: ${providerResponse.status}, Response:`, providerData);
    //     // Return a more specific error if possible
    //     return NextResponse.json({ error: providerData.message || "Failed to initiate OTP session with provider.", details: providerData }, { status: providerResponse.status });
    //   }
    //   
    //   // IMPORTANT: Check the actual field name for tokenAuth from MSG91's response structure.
    //   // It might be 'tokenAuth', 'token', 'session_id', etc.
    //   const tokenAuth = providerData.tokenAuth || providerData.data?.tokenAuth || providerData.data?.token; 
    //   if (!tokenAuth) { 
    //      console.error("tokenAuth not found in provider response:", providerData);
    //      throw new Error("tokenAuth not received from provider.");
    //   }
    //   
    //   console.log(`Successfully initiated OTP with provider. TokenAuth received for ${phoneNumber}.`);
    //   return NextResponse.json({ 
    //     message: `OTP session initiated for +91 ${phoneNumber}. Widget can now be initialized.`,
    //     tokenAuth: tokenAuth 
    //   }, { status: 200 });

    // } catch (apiError: any) {
    //   console.error(`Error calling MSG91 API for ${phoneNumber}:`, apiError);
    //   return NextResponse.json({ error: apiError.message || "Failed to communicate with OTP provider." }, { status: 500 });
    // }
    // =====================================================================================


    // SIMULATED RESPONSE (Remove this block when actual API call above is implemented and working)
    // For this demo, we'll generate a mock tokenAuth.
    // In a real scenario, this tokenAuth comes from the SMS provider after initiating an OTP request with your serverAuthKey.
    const tokenAuth = `mock-session-token-for-${phoneNumber}-widget-${widgetId}-${Date.now()}`;
    console.log(`Simulated OTP session initiation for ${phoneNumber}. TokenAuth: ${tokenAuth}`);
    // END OF SIMULATED RESPONSE

    return NextResponse.json({ 
      message: `OTP session initiated for +91 ${phoneNumber}. Widget can now be initialized (SIMULATED).`,
      tokenAuth: tokenAuth // This tokenAuth is for the client-side widget
    }, { status: 200 });

  } catch (error: any) {
    console.error("Initiate OTP Session error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
