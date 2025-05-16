import { PricingForm } from "@/components/pricing/pricing-form";

export default function PricingToolPage() {
  return (
    <div className="container mx-auto py-8">
       <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Pricing Tool</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">Leverage AI to find the optimal price for your agricultural equipment and services.</p>
      </div>
      <PricingForm />
    </div>
  );
}
