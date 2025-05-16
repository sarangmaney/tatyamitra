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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wand2 } from "lucide-react";
import { suggestPricing, type SuggestPricingInput, type SuggestPricingOutput } from "@/ai/flows/suggest-pricing";
import { useToast } from "@/hooks/use-toast";

const pricingFormSchema = z.object({
  acreage: z.coerce.number().positive("Acreage must be a positive number."),
  equipmentType: z.string().min(3, "Equipment type must be at least 3 characters."),
  comparableListings: z.string().min(10, "Comparable listings must be at least 10 characters."),
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
      acreage: undefined,
      equipmentType: "",
      comparableListings: "",
    },
  });

  const onSubmit = async (data: PricingFormValues) => {
    setIsLoading(true);
    setSuggestion(null);
    setFinalPrice("");
    try {
      const result = await suggestPricing(data);
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
              name="acreage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acreage</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10" {...field} />
                  </FormControl>
                  <FormDescription>Enter the total acreage for the service or equipment use.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      rows={5}
                      {...field}
                    />
                  </FormControl>
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
              <Card className="bg-muted/50 p-6">
                <CardTitle className="text-xl mb-2">AI Suggestion</CardTitle>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Suggested Price</Label>
                    <p className="text-3xl font-bold text-primary">₹{suggestion.suggestedPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Reasoning</Label>
                    <p className="text-sm text-foreground/80">{suggestion.reasoning}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finalPrice" className="text-sm font-medium">Your Final Price (Editable)</Label>
                    <Input 
                      id="finalPrice"
                      type="number"
                      value={finalPrice}
                      onChange={(e) => setFinalPrice(e.target.value)}
                      className="border-primary ring-primary focus-visible:ring-primary"
                    />
                    <FormDescription>You can override the AI's suggestion.</FormDescription>
                  </div>
                   <Button className="w-full" onClick={() => alert(`Final price set to: ₹${finalPrice}`)}>
                    Set This Price
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
