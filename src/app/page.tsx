
"use client";

import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type ViewState = "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = React.useState<ViewState>("phone");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }
      toast({ title: "OTP Sent", description: data.message || "OTP has been sent to your phone number (simulated)." });
      setView("otp");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      toast({ title: "Error", description: err.message || "Could not send OTP.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) { // Basic OTP length validation
      setError("Please enter a valid OTP.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed");
      }
      toast({ title: "Login Successful", description: "You have been successfully logged in." });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      toast({ title: "Error", description: err.message || "Invalid OTP or an error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (view === "phone") {
      handleSendOtp();
    } else {
      handleVerifyOtp();
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Allow only digits
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };
  
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Allow only digits
    if (value.length <= 6) { // Assuming OTP length is 6
      setOtp(value);
    }
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center items-center mb-4">
            <Logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Tatya Mitra</CardTitle>
          <CardDescription>
            {view === "phone"
              ? "Welcome back! Please enter your phone number to login."
              : `Enter the OTP sent to +91 ${phoneNumber}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {view === "phone" ? (
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
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="tel" // Use tel for numeric keyboard on mobile
                  placeholder="Enter OTP"
                  required
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? "Processing..." : view === "phone" ? "Send OTP" : "Verify OTP & Login"}
            </Button>
          </form>

          {view === "otp" && (
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => { setView("phone"); setError(null); setOtp(""); }} disabled={isLoading}>
                Change phone number
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-sm text-center">
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
  );
}
