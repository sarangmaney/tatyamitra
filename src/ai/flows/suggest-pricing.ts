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

const SuggestPricingInputSchema = z.object({
  acreage: z.number().describe('The acreage for which the equipment or service is being offered.'),
  equipmentType: z.string().describe('The type of equipment or service being offered.'),
  comparableListings: z.string().describe('A description of the comparable listings and their prices.'),
});
export type SuggestPricingInput = z.infer<typeof SuggestPricingInputSchema>;

const SuggestPricingOutputSchema = z.object({
  suggestedPrice: z.number().describe('The suggested price for the equipment or service based on the acreage and comparable listings.'),
  reasoning: z.string().describe('The reasoning behind the suggested price.'),
});
export type SuggestPricingOutput = z.infer<typeof SuggestPricingOutputSchema>;

export async function suggestPricing(input: SuggestPricingInput): Promise<SuggestPricingOutput> {
  return suggestPricingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPricingPrompt',
  input: {schema: SuggestPricingInputSchema},
  output: {schema: SuggestPricingOutputSchema},
  prompt: `You are an expert in agricultural equipment and service pricing. Based on the acreage, equipment type, and comparable listings provided, suggest a competitive price for the equipment or service.

Acreage: {{acreage}}
Equipment Type: {{equipmentType}}
Comparable Listings: {{comparableListings}}

Consider the following factors when determining the price:
* Market value of similar equipment or services
* The cost of operation and maintenance
* The demand for the equipment or service
* Vendor profit margin

Provide a suggested price and a brief explanation of your reasoning.`,
});

const suggestPricingFlow = ai.defineFlow(
  {
    name: 'suggestPricingFlow',
    inputSchema: SuggestPricingInputSchema,
    outputSchema: SuggestPricingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
