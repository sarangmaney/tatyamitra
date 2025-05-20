
"use client"; // Add this if not present, as Link and useRouter are client-side

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VendorEquipmentForm } from "@/components/onboarding/vendor-equipment-form";
import { ArrowLeft } from "lucide-react";

export default function VendorEquipmentRegistrationPage() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Button asChild variant="outline" className="w-auto">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back to Log In
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 text-center">
          Join Tatya Mitra as a Partner
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          List your equipment and start earning. Complete these simple steps.
        </p>
        <VendorEquipmentForm />
      </div>
    </div>
  );
}
