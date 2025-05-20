
'use server';

/**
 * @fileOverview AI flow for suggesting prices for equipment or services based on acreage and comparable listings.
 *
 * - suggestPricing - A function that handles the price suggestion process.
 * - SuggestPricingInput - The input type for the suggestPricing function.
 * - SuggestPricingOutput - The return type for the suggestPricing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PricingUnitEnum = z.enum(["Per Acre", "Per Day", "Per Hour"]);

const SuggestPricingInputSchema = z.object({
  acreage: z.number().describe('The acreage for which the equipment or service is being offered (if applicable). Can be 0 or omitted if pricing unit is per day/hour without direct acreage dependency.'),
  equipmentType: z.string().describe('The type of equipment or service being offered.'),
  comparableListings: z.string().describe('A description of the comparable listings and their prices.'),
  pricingUnit: PricingUnitEnum.describe('The unit for which the price is being suggested (e.g., Per Acre, Per Day, Per Hour).'),
  travelCharge: z.number().optional().describe('Optional travel charge to be considered or added.'),
  additionalConsiderations: z.string().optional().describe('Any other relevant details or considerations for pricing, like special features, demand, or local conditions.'),
});
export type SuggestPricingInput = z.infer<typeof SuggestPricingInputSchema>;

const SuggestPricingOutputSchema = z.object({
  suggestedPrice: z.number().describe('The suggested price for the equipment or service based on the inputs.'),
  reasoning: z.string().describe('The reasoning behind the suggested price.'),
  effectivePricingUnit: PricingUnitEnum.describe('The pricing unit for the suggested price.')
});
export type SuggestPricingOutput = z.infer<typeof SuggestPricingOutputSchema>;

export async function suggestPricing(input: SuggestPricingInput): Promise<SuggestPricingOutput> {
  return suggestPricingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPricingPrompt',
  input: {schema: SuggestPricingInputSchema},
  output: {schema: SuggestPricingOutputSchema},
  prompt: `You are an expert in agricultural equipment and service pricing. Based on the details provided, suggest a competitive price.

Details:
- Equipment Type: {{equipmentType}}
- Acreage (if relevant for unit): {{acreage}}
- Desired Pricing Unit: {{pricingUnit}}
- Comparable Listings/Market Info: {{comparableListings}}
{{#if travelCharge}}
- Travel Charge to consider: {{travelCharge}}
{{/if}}
{{#if additionalConsiderations}}
- Additional Considerations: {{additionalConsiderations}}
{{/if}}

Consider the following factors when determining the price:
* Market value of similar equipment or services.
* The cost of operation and maintenance.
* The demand for the equipment or service.
* Vendor profit margin.
* How the pricing unit ({{pricingUnit}}) affects typical charges for {{equipmentType}}. For example, per-acre might be common for spraying, while per-hour might be for tractors.
* If travel charge is mentioned, clarify if your suggested price includes it or if it should be separate.

Provide a suggestedPrice, a brief reasoning, and confirm the effectivePricingUnit for your suggestion.
The effectivePricingUnit should match the input pricingUnit.
`,
});

const suggestPricingFlow = ai.defineFlow(
  {
    name: 'suggestPricingFlow',
    inputSchema: SuggestPricingInputSchema,
    outputSchema: SuggestPricingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure the output includes the pricing unit, defaulting to input if AI doesn't specify
    return {
        ...output!,
        effectivePricingUnit: output?.effectivePricingUnit || input.pricingUnit
    };
  }
);

