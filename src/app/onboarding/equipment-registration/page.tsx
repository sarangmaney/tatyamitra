
import { VendorEquipmentForm } from "@/components/onboarding/vendor-equipment-form";

export default function VendorEquipmentRegistrationPage() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
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
