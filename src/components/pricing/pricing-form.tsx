
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wand2, Tags, Truck, Info } from "lucide-react";
import { suggestPricing, type SuggestPricingInput, type SuggestPricingOutput } from "@/ai/flows/suggest-pricing";
import { useToast } from "@/hooks/use-toast";

const PricingUnitEnum = z.enum(["Per Acre", "Per Day", "Per Hour"]);

const pricingFormSchema = z.object({
  acreage: z.coerce.number().min(0, "Acreage must be zero or a positive number.").optional().default(0),
  equipmentType: z.string().min(3, "Equipment type must be at least 3 characters."),
  comparableListings: z.string().min(10, "Comparable listings must be at least 10 characters."),
  pricingUnit: PricingUnitEnum,
  travelCharge: z.coerce.number().min(0, "Travel charge must be zero or a positive number.").optional(),
  additionalConsiderations: z.string().max(500, "Too long. Max 500 characters.").optional(),
});

type PricingFormValues = z.infer<typeof pricingFormSchema>;

export function PricingForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<SuggestPricingOutput | null>(null);
  const [finalPrice, setFinalPrice] = React.useState<number | string>("");
  const { toast } = useToast();

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      acreage: 0,
      equipmentType: "",
      comparableListings: "",
      pricingUnit: "Per Acre",
      travelCharge: undefined,
      additionalConsiderations: "",
    },
  });

  const onSubmit = async (data: PricingFormValues) => {
    setIsLoading(true);
    setSuggestion(null);
    setFinalPrice("");

    const inputData: SuggestPricingInput = {
      ...data,
      acreage: data.acreage || 0, // Ensure acreage is a number
    };

    try {
      const result = await suggestPricing(inputData);
      setSuggestion(result);
      setFinalPrice(result.suggestedPrice);
      toast({
        title: "Price Suggestion Ready!",
        description: "AI has generated a price suggestion for you.",
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
    // In a real app, you'd have logic here to determine which equipment is being priced
    // and then make an API call to update that equipment's details in Firestore.
    console.log("Final price to set:", finalPrice);
    toast({
      title: "Price Set (Simulated)",
      description: `The price ₹${finalPrice} would be saved for the relevant equipment. This feature needs to be fully implemented to update database records.`,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Wand2 className="h-7 w-7 text-primary" />
          AI Pricing Suggestion Tool
        </CardTitle>
        <CardDescription>
          Get AI-powered price suggestions for your equipment or services based on acreage and comparable market data.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
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
                    <Input type="number" placeholder="e.g., 200" {...field} onChange={event => field.onChange(+event.target.value)} />
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
          <CardFooter className="flex flex-col items-stretch gap-4">
            <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Suggest Price
            </Button>
          
            {suggestion && (
              <Card className="bg-muted/50 p-6 mt-6">
                <CardTitle className="text-xl mb-3">AI Suggestion</CardTitle>
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
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="finalPrice" className="text-sm font-medium">Your Final Price (Editable)</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="finalPrice"
                        type="number"
                        value={finalPrice}
                        onChange={(e) => setFinalPrice(e.target.value)}
                        className="border-primary ring-primary focus-visible:ring-primary"
                      />
                       <span className="text-sm text-muted-foreground">({suggestion.effectivePricingUnit})</span>
                    </div>
                    <FormDescription>You can override the AI's suggestion.</FormDescription>
                  </div>
                   <Button className="w-full mt-2" onClick={handleSetPrice}>
                    Set This Price for Equipment
                  </Button>
                </div>
              </Card>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

