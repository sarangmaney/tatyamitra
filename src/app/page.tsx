
"use client";

import Link from "next/link";
import * as React from "react";
import Script from "next/script"; // Import next/script
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

declare global {
  interface Window {
    initSendOTP?: (configuration: any) => void;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isOtpWidgetInitialized, setIsOtpWidgetInitialized] = React.useState(false);
  const [otpWidgetContainerId] = React.useState(`otp-widget-container-${Date.now()}`); // Unique ID for the widget container


  const handlePhoneNumberSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Call your backend to get a session token for the OTP widget
      const sessionResponse = await fetch("/api/auth/initiate-otp-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const sessionData = await sessionResponse.json();

      if (!sessionResponse.ok || !sessionData.tokenAuth) {
        throw new Error(sessionData.error || "Failed to initiate OTP session.");
      }

      // Step 2: Configure and initialize the OTP widget
      const configuration = {
        widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || "YOUR_MSG91_WIDGET_ID_HERE", // Get from env
        tokenAuth: sessionData.tokenAuth, // Token from your backend
        identifier: phoneNumber, // User's phone number
        // target: `#${otpWidgetContainerId}`, // Specify a target div for the widget if needed
        exposeMethods: true, // Optional: if you want to call widget methods like resendOTP()
        success: async (data: any) => {
          console.log("OTP verification success (from widget):", data);
          setIsLoading(true);
          // Step 3: Send verification data to your backend to finalize login
          try {
            const loginResponse = await fetch("/api/auth/finalize-login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phoneNumber, verificationData: data }),
            });
            const loginResult = await loginResponse.json();
            if (!loginResponse.ok) {
              throw new Error(loginResult.error || "Login finalization failed.");
            }
            toast({ title: "Login Successful", description: "You have been successfully logged in." });
            router.push("/dashboard");
          } catch (finalLoginError: any) {
            setError(finalLoginError.message || "Could not finalize login.");
            toast({ title: "Login Error", description: finalLoginError.message, variant: "destructive" });
          } finally {
            setIsLoading(false);
          }
        },
        failure: (errorData: any) => {
          console.error("OTP verification failure (from widget):", errorData);
          setError(errorData.message || "OTP verification failed. Please try again.");
          toast({ title: "OTP Error", description: errorData.message || "Verification failed.", variant: "destructive" });
          setIsLoading(false);
          setIsOtpWidgetInitialized(false); // Allow user to try again or change number
        },
      };
      
      if (window.initSendOTP) {
        window.initSendOTP(configuration);
        setIsOtpWidgetInitialized(true); 
      } else {
        throw new Error("OTP Widget script not loaded yet.");
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setIsLoading(false); // Ensure loading stops on error before widget init
    }
  };
  
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  return (
    <>
      <Script
        src="https://verify.msg91.com/otp-provider.js" // Replace with your provider's script URL
        strategy="lazyOnload"
        onLoad={() => {
          console.log("OTP Provider script loaded.");
        }}
        onError={(e) => {
          console.error("Failed to load OTP Provider script:", e);
          setError("Could not load OTP service. Please try again later.");
          toast({title: "Service Error", description: "OTP service failed to load.", variant: "destructive"});
        }}
      />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center items-center mb-4">
              <Logo className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Tatya Mitra</CardTitle>
            <CardDescription>
              {isOtpWidgetInitialized ? "Enter the OTP sent to your phone." : "Welcome back! Please enter your phone number to login."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isOtpWidgetInitialized ? (
              <form onSubmit={handlePhoneNumberSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center">
                    <span className="flex h-10 items-center justify-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                      +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your 10-digit number"
                      required
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      className="rounded-l-none"
                      disabled={isLoading}
                      maxLength={10}
                    />
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send OTP"}
                </Button>
              </form>
            ) : (
              <div id={otpWidgetContainerId} className="min-h-[100px]"> {/* Container for MSG91 widget */}
                {isLoading && !error && <div className="flex justify-center items-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary"/> <span className="ml-2">Verifying OTP...</span></div>}
                {/* The MSG91 OTP widget will render here. */}
                {!isLoading && error && (
                   <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                 {!isLoading && (
                    <Button variant="link" onClick={() => { setIsOtpWidgetInitialized(false); setError(null); }} className="mt-2 text-sm">
                        Change phone number
                    </Button>
                 )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-sm text-center">
            <div>
              <p>Don&apos;t have an account?</p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/signup">
                Sign up
              </Link>
            </Button>
            <p className="pt-2">
              Proceed to KYC?{" "}
              <Link href="/kyc" className="font-medium text-primary hover:underline">
                KYC Verification
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
