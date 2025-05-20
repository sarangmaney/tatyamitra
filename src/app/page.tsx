
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, OTP would be sent and verified.
    // For now, simulate successful login and redirect to dashboard.
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center items-center mb-4">
            <Logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Tatya Mitra</CardTitle>
          <CardDescription>Welcome back! Please enter your phone number to login.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="rounded-l-none"
                  maxLength={10}
                />
              </div>
            </div>
            {/* In a real app, an OTP input would appear after phone submission */}
            {/* <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input id="otp" type="text" placeholder="Enter OTP" />
            </div> */}
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
              Send OTP / Login
            </Button>
          </form>
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
