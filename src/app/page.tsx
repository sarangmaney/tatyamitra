
"use client";

import Link from "next/link";
import * as React from "react";
import Script from "next/script"; 
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
  const [otpWidgetContainerId] = React.useState(`otp-widget-container-${Date.now()}`); 


  const handlePhoneNumberSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const sessionResponse = await fetch("/api/auth/initiate-otp-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const sessionData = await sessionResponse.json();

      if (!sessionResponse.ok || !sessionData.tokenAuth) {
        throw new Error(sessionData.error || "Failed to initiate OTP session.");
      }

      const configuration = {
        widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || "YOUR_DEFAULT_WIDGET_ID", // Get from env, provide a fallback if needed
        tokenAuth: sessionData.tokenAuth, 
        identifier: phoneNumber, 
        target: `#${otpWidgetContainerId}`, // Specify the target div for the widget
        exposeMethods: true, 
        success: async (data: any) => {
          console.log("OTP verification success (from widget):", data);
          setIsLoading(true);
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
          setIsOtpWidgetInitialized(false); 
        },
      };
      
      if (window.initSendOTP) {
        window.initSendOTP(configuration);
        setIsOtpWidgetInitialized(true); 
      } else {
        // It's possible the script hasn't loaded yet, or initSendOTP isn't global immediately.
        // One strategy is to wait briefly if onLoad from Script component hasn't fired or if initSendOTP isn't ready.
        // For simplicity here, we assume it should be ready if the script load was successful (handled by Script's onLoad).
        // If issues persist, one might need a more robust check or event system.
        console.warn("initSendOTP function not found on window. Ensure the MSG91 script is loaded and initialized correctly.");
        throw new Error("OTP Widget script not ready.");
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setIsLoading(false); 
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
        src="https://verify.msg91.com/otp-provider.js" 
        strategy="lazyOnload" // Load after page content is interactive
        onLoad={() => {
          console.log("MSG91 OTP Provider script loaded successfully.");
          // You could set a flag here if needed, e.g., setScriptLoaded(true)
        }}
        onError={(e) => {
          console.error("Failed to load MSG91 OTP Provider script:", e);
          setError("Could not load OTP service. Please try refreshing the page or contact support if the issue persists.");
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
              {isOtpWidgetInitialized ? "Verifying your phone number..." : "Welcome back! Please enter your phone number to login."}
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
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send OTP / Login"}
                </Button>
              </form>
            ) : (
              <div id={otpWidgetContainerId} className="min-h-[150px] flex flex-col justify-center items-center"> 
                {/* The MSG91 OTP widget will render here. */}
                {/* We can add a placeholder or loader while the widget initializes if needed */}
                {isLoading && !error && <div className="flex justify-center items-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary"/> <span className="ml-2">Processing...</span></div>}
                
                {!isLoading && error && ( // Show error if widget init failed or other errors
                   <Alert variant="destructive" className="mt-4 w-full">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                 {/* Button to change number if widget init fails or user wants to change */}
                 {!isLoading && (
                    <Button variant="link" onClick={() => { setIsOtpWidgetInitialized(false); setError(null); setIsLoading(false); }} className="mt-4 text-sm">
                        Enter a different phone number
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
