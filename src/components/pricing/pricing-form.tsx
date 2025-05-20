
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardContent, CardFooter } from "@/components/ui/card"; // Removed Card, CardHeader, CardTitle, CardDescription
import { Loader2, Wand2, Tags, Truck, Info, Settings2 } from "lucide-react";
import { suggestPricing, type SuggestPricingInput, type SuggestPricingOutput } from "@/ai/flows/suggest-pricing";
import { useToast } from "@/hooks/use-toast";

const PricingUnitEnum = z.enum(["Per Acre", "Per Day", "Per Hour"]);

// Mock data for registered equipment - replace with actual data fetching
const mockRegisteredEquipment = [
  { id: "eq1", name: "Mahindra JIVO 245 DI (Tractor)" },
  { id: "eq2", name: "Crop Spraying Drone (10L)" },
  { id: "eq3", name: "Rotavator Attachment (6ft)" },
];

interface PricingFormProps {
  showEquipmentSelection: boolean;
  showSetPriceButton: boolean;
  formId: string; // Unique ID for each form instance
}

const pricingFormSchemaBase = z.object({
  selectedEquipmentId: z.string().optional(),
  equipmentType: z.string().optional(),
  acreage: z.coerce.number().min(0, "Acreage must be zero or a positive number.").optional().default(0),
  comparableListings: z.string().min(10, "Comparable listings must be at least 10 characters."),
  pricingUnit: PricingUnitEnum,
  travelCharge: z.coerce.number().min(0, "Travel charge must be zero or a positive number.").optional(),
  additionalConsiderations: z.string().max(500, "Too long. Max 500 characters.").optional(),
});

type PricingFormValues = z.infer<typeof pricingFormSchemaBase>;

export function PricingForm({ showEquipmentSelection, showSetPriceButton, formId }: PricingFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<SuggestPricingOutput | null>(null);
  const [finalPrice, setFinalPrice] = React.useState<number | string>("");
  const { toast } = useToast();

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(
      pricingFormSchemaBase.superRefine((data, ctx) => {
        if (showEquipmentSelection && !data.selectedEquipmentId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["selectedEquipmentId"],
            message: "Please select an equipment.",
          });
        }
        if (!showEquipmentSelection && (!data.equipmentType || data.equipmentType.length < 3)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["equipmentType"],
            message: "Equipment type must be at least 3 characters.",
          });
        }
      })
    ),
    defaultValues: {
      acreage: 0,
      equipmentType: !showEquipmentSelection ? "" : undefined,
      selectedEquipmentId: undefined,
      comparableListings: "",
      pricingUnit: "Per Acre",
      travelCharge: undefined,
      additionalConsiderations: "",
    },
  });

  const selectedEquipmentName = showEquipmentSelection && form.watch("selectedEquipmentId")
    ? mockRegisteredEquipment.find(eq => eq.id === form.watch("selectedEquipmentId"))?.name
    : null;

  const onSubmit = async (data: PricingFormValues) => {
    setIsLoading(true);
    setSuggestion(null);
    setFinalPrice("");

    let actualEquipmentType = "";
    if (showEquipmentSelection && data.selectedEquipmentId) {
      actualEquipmentType = mockRegisteredEquipment.find(eq => eq.id === data.selectedEquipmentId)?.name || "Unknown Equipment";
    } else if (data.equipmentType) {
      actualEquipmentType = data.equipmentType;
    } else {
      // This case should be prevented by form validation
      toast({ title: "Error", description: "Equipment type or selection is missing.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const inputData: SuggestPricingInput = {
      acreage: data.acreage || 0,
      equipmentType: actualEquipmentType,
      comparableListings: data.comparableListings,
      pricingUnit: data.pricingUnit,
      travelCharge: data.travelCharge,
      additionalConsiderations: data.additionalConsiderations,
    };

    try {
      const result = await suggestPricing(inputData);
      setSuggestion(result);
      setFinalPrice(result.suggestedPrice);
      toast({
        title: "Price Suggestion Ready!",
        description: `AI has generated a price suggestion for ${actualEquipmentType}.`,
      });
    } catch (error) {
      console.error("Error fetching price suggestion:", error);
      toast({
        title: "Error",
        description: "Could not fetch price suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (suggestion) {
      setFinalPrice(suggestion.suggestedPrice);
    }
  }, [suggestion]);

  const handleSetPrice = () => {
    let equipmentNameToSet = "the equipment";
    if (showEquipmentSelection && form.getValues("selectedEquipmentId")) {
      equipmentNameToSet = mockRegisteredEquipment.find(eq => eq.id === form.getValues("selectedEquipmentId"))?.name || "the selected equipment";
    } else if (!showEquipmentSelection && form.getValues("equipmentType")) {
      equipmentNameToSet = form.getValues("equipmentType") || "the equipment";
    }
    
    console.log(`Final price to set for ${equipmentNameToSet}:`, finalPrice);
    toast({
      title: "Price Set (Simulated)",
      description: `The price ₹${finalPrice} would be saved for ${equipmentNameToSet}. This feature needs to be fully implemented to update database records.`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id={formId} className="flex flex-col flex-grow">
        <CardContent className="space-y-6 flex-grow">
          {showEquipmentSelection ? (
            <FormField
              control={form.control}
              name="selectedEquipmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Registered Equipment</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an equipment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockRegisteredEquipment.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="equipmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment/Service Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tractor Ploughing, Drone Spraying" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pricingUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Tags className="mr-2 h-4 w-4 text-muted-foreground" />Pricing Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Per Acre">Per Acre</SelectItem>
                      <SelectItem value="Per Day">Per Day</SelectItem>
                      <SelectItem value="Per Hour">Per Hour</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acreage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acreage (if relevant)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10" {...field} />
                  </FormControl>
                  <FormDescription>Relevant for 'Per Acre' unit. Can be 0 otherwise.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="comparableListings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comparable Listings/Market Info</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe similar listings, their prices, and any other relevant market information. e.g., 'Similar tractor ploughing service in nearby village costs ₹1500/acre. Another online listing for 50HP tractor is ₹800/hour.'"
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="travelCharge"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><Truck className="mr-2 h-4 w-4 text-muted-foreground" />Travel Charge (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 200" {...field} onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)} />
                </FormControl>
                <FormDescription>Enter any fixed travel charge, if applicable.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalConsiderations"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><Info className="mr-2 h-4 w-4 text-muted-foreground" />Additional Considerations (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., High demand season, Complex terrain, Specific model benefits..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Any other factors for the AI to consider.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4 mt-auto pt-6"> {/* Added mt-auto and pt-6 */}
          <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {showEquipmentSelection && selectedEquipmentName ? `Suggest Price for ${selectedEquipmentName}` : "Suggest Price"}
          </Button>
        
          {suggestion && (
            <div className="bg-muted/50 p-6 mt-4 rounded-lg"> {/* Changed from Card to div */}
              <h3 className="text-xl font-semibold mb-3">AI Suggestion</h3> {/* Changed from CardTitle */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Suggested Price</Label>
                  <p className="text-3xl font-bold text-primary">
                    ₹{suggestion.suggestedPrice.toLocaleString()} 
                    <span className="text-base font-normal text-muted-foreground ml-1">({suggestion.effectivePricingUnit})</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reasoning</Label>
                  <p className="text-sm text-foreground/80">{suggestion.reasoning}</p>
                </div>
                {showSetPriceButton && (
                  <>
                    <div className="space-y-2 pt-2">
                      <Label htmlFor={`${formId}-finalPrice`} className="text-sm font-medium">Your Final Price (Editable)</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id={`${formId}-finalPrice`}
                          type="number"
                          value={finalPrice}
                          onChange={(e) => setFinalPrice(e.target.value)}
                          className="border-primary ring-primary focus-visible:ring-primary"
                        />
                        <span className="text-sm text-muted-foreground">({suggestion.effectivePricingUnit})</span>
                      </div>
                      <FormDescription>You can override the AI's suggestion.</FormDescription>
                    </div>
                    <Button 
                        className="w-full mt-2 bg-primary hover:bg-primary/90" 
                        onClick={handleSetPrice}
                        disabled={!finalPrice || (typeof finalPrice === 'string' && finalPrice.trim() === '')}
                    >
                      <Settings2 className="mr-2 h-4 w-4" />
                      Set This Price {selectedEquipmentName ? `for ${selectedEquipmentName}` : ""}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </CardFooter>
      </form>
    </Form>
  );
}
