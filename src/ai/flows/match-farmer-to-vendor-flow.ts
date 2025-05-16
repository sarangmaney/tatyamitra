'use server';
/**
 * @fileOverview AI flow for matching farmers to suitable vendors based on agricultural needs and vendor capabilities.
 *
 * - matchFarmerToVendor - A function that handles the farmer-vendor matching process.
 * - MatchFarmerToVendorInput - The input type for the matchFarmerToVendor function.
 * - MatchFarmerToVendorOutput - The return type for the matchFarmerToVendor function.
 * - VendorEquipmentInfo - Represents basic info about a vendor's equipment.
 * - VendorProfileInfo - Represents basic info about a vendor for matching.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define a schema for individual equipment to be listed under a vendor
export const VendorEquipmentInfoSchema = z.object({
  id: z.string().describe("Unique ID of the equipment"),
  name: z.string().describe("Name of the equipment, e.g., 'Mahindra JIVO 245 DI'"),
  category: z.string().describe("Category of the equipment, e.g., 'Tractor', 'Drone', 'Harvester'"),
  // Add other key specs relevant for matching if needed
  // e.g. acresCapacityPerDay: z.number().optional().describe("Acres the equipment can cover per day"),
});
export type VendorEquipmentInfo = z.infer<typeof VendorEquipmentInfoSchema>;

// Define a schema for the vendor profile information needed for matching
export const VendorProfileInfoSchema = z.object({
  vendorId: z.string().describe("Unique ID of the vendor"),
  vendorName: z.string().describe("Name of the vendor or rental center"),
  locationDistrict: z.string().describe("District where the vendor is primarily located or serves"),
  locationTaluka: z.string().optional().describe("Taluka where the vendor is located or serves"),
  serviceableRadiusKm: z.number().optional().describe("Maximum distance in kilometers the vendor is willing to serve"),
  equipments: z.array(VendorEquipmentInfoSchema).describe("List of equipments offered by the vendor"),
  // Add other relevant vendor fields, e.g. averageRating: z.number().optional()
});
export type VendorProfileInfo = z.infer<typeof VendorProfileInfoSchema>;


// Define the input schema for the matching flow
const MatchFarmerToVendorInputSchema = z.object({
  farmerSoilType: z.string().describe("Soil type of the farmer's land, e.g., 'Clay', 'Loamy', 'Black Cotton Soil'"),
  farmerCropType: z.string().describe("Crop type being cultivated by the farmer, e.g., 'Cotton', 'Sugarcane', 'Wheat'"),
  farmerLocationDistrict: z.string().describe("District of the farmer's land"),
  farmerLocationTaluka: z.string().optional().describe("Taluka of the farmer's land"),
  farmerLandSizeAcres: z.number().describe("Total land size in acres for which equipment is needed"),
  serviceNeeded: z.string().describe("Specific service or type of equipment the farmer is looking for, e.g., 'Ploughing', 'Spraying Drone', 'Harvester'"),
  vendors: z.array(VendorProfileInfoSchema).describe("List of available vendor profiles to match against."),
});
export type MatchFarmerToVendorInput = z.infer<typeof MatchFarmerToVendorInputSchema>;

// Define the output schema for a single matched vendor
const MatchedVendorSchema = z.object({
  vendorId: z.string(),
  vendorName: z.string(),
  matchScore: z.number().min(0).max(1).describe("A score from 0 to 1 indicating the suitability of the match."),
  reasoning: z.string().describe("A brief explanation of why this vendor is a good match."),
  suggestedEquipment: z.array(VendorEquipmentInfoSchema).optional().describe("Specific equipment from the vendor that are relevant."),
});

// Define the overall output schema for the flow
const MatchFarmerToVendorOutputSchema = z.object({
  matchedVendors: z.array(MatchedVendorSchema).describe("A list of vendors sorted by match suitability (best first)."),
});
export type MatchFarmerToVendorOutput = z.infer<typeof MatchFarmerToVendorOutputSchema>;


// Exported function to be called by the application
export async function matchFarmerToVendor(input: MatchFarmerToVendorInput): Promise<MatchFarmerToVendorOutput> {
  return matchFarmerToVendorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchFarmerToVendorPrompt',
  input: {schema: MatchFarmerToVendorInputSchema},
  output: {schema: MatchFarmerToVendorOutputSchema},
  prompt: `You are an agricultural expert specializing in matching farmers with the most suitable equipment vendors.
Your task is to analyze the farmer's requirements and a list of available vendors to provide the best possible matches.

Farmer's Requirements:
- Soil Type: {{farmerSoilType}}
- Crop Type: {{farmerCropType}}
- Location: District - {{farmerLocationDistrict}}{{#if farmerLocationTaluka}}, Taluka - {{farmerLocationTaluka}}{{/if}}
- Land Size: {{farmerLandSizeAcres}} acres
- Service/Equipment Needed: {{serviceNeeded}}

Available Vendors:
{{#each vendors}}
- Vendor ID: {{vendorId}}
  - Name: {{vendorName}}
  - Location: District - {{locationDistrict}}{{#if locationTaluka}}, Taluka - {{locationTaluka}}{{/if}}
  {{#if serviceableRadiusKm}} - Serviceable Radius: {{serviceableRadiusKm}} km{{/if}}
  - Equipment:
    {{#each equipments}}
    - {{name}} (Category: {{category}}, ID: {{id}})
    {{/each}}
{{/each}}

Based on this information, please identify the top vendors that would be a good match for the farmer.
Consider the following factors for matching:
1.  **Equipment Suitability**: Does the vendor offer the type of equipment or service the farmer needs? Is it suitable for the farmer's crop type, soil type, and land size?
2.  **Location Proximity**: Is the vendor located in or serving the farmer's district/taluka? If serviceable radius is provided, consider if the farmer falls within that radius (assume farmer is in the center of their taluka/district for this estimation if exact coordinates are not available). Prioritize closer vendors.
3.  **Capacity**: While not explicitly detailed for all equipment, infer if the vendor's equipment (e.g., type of tractor) is generally suitable for the land size.

For each matched vendor, provide:
- Their vendorId and vendorName.
- A matchScore (0.0 to 1.0, where 1.0 is a perfect match).
- A brief reasoning for the match.
- Optionally, list specific equipment from the vendor that are most relevant.

Return a list of matched vendors, ideally sorted with the best matches first. If no vendors are a good match, return an empty list or a list with low scores and appropriate reasoning.
Focus on practical and helpful matches.
`,
});

const matchFarmerToVendorFlow = ai.defineFlow(
  {
    name: 'matchFarmerToVendorFlow',
    inputSchema: MatchFarmerToVendorInputSchema,
    outputSchema: MatchFarmerToVendorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    // Ensure output is not null, though the schema should enforce it.
    // The AI output will already be sorted if it followed instructions, but you could re-sort here if needed.
    return output!;
  }
);
