"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";
import { useRouter } from "next/navigation";

export default function KYCPage() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, KYC documents would be uploaded and verified.
    // For now, simulate successful KYC and redirect to dashboard.
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center items-center mb-4">
            <Logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">KYC Verification</CardTitle>
          <CardDescription>Please complete your KYC to access all features.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Input id="documentType" type="text" placeholder="e.g., Aadhaar, PAN Card" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentNumber">Document Number</Label>
              <Input id="documentNumber" type="text" placeholder="Enter document number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentUpload">Upload Document</Label>
              <Input id="documentUpload" type="file" required />
              <p className="text-xs text-muted-foreground">Upload a clear image or PDF of your document.</p>
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
              Submit for Verification
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            <Link href="/dashboard" className="font-medium text-primary hover:underline">
              Skip for now
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
