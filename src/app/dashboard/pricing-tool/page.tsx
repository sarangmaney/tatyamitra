
import { PricingForm } from "@/components/pricing/pricing-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Tags } from "lucide-react";

export default function PricingToolPage() {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Pricing Tools</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Leverage AI to find the optimal price for your agricultural equipment and services.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Card 1: General Suggestion */}
        <Card className="shadow-xl flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wand2 className="h-6 w-6 text-primary" />
              General Price Suggestion
            </CardTitle>
            <CardDescription>
              Get an AI-powered price estimate for any equipment type you describe.
            </CardDescription>
          </CardHeader>
          <PricingForm 
            showEquipmentSelection={false} 
            showSetPriceButton={false} 
            formId="general-pricing-form"
          />
        </Card>

        {/* Card 2: Price Registered Equipment */}
        <Card className="shadow-xl flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Tags className="h-6 w-6 text-primary" />
              Price Your Registered Equipment
            </CardTitle>
            <CardDescription>
              Select your equipment, get an AI suggestion, and set your price.
            </CardDescription>
          </CardHeader>
          <PricingForm 
            showEquipmentSelection={true} 
            showSetPriceButton={true} 
            formId="specific-pricing-form"
          />
        </Card>
      </div>
    </div>
  );
}
