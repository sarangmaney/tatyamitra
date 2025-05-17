
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
// import { db } from '@/lib/firebase-admin'; // Uncomment when ready for Firestore

// Define Zod schema for the detailed equipment response
const DetailedEquipmentSchema = z.object({
  equipmentId: z.string(),
  vendorId: z.string(),
  vendorName: z.string().optional(), // Optionally include vendor name
  name: z.string().describe("Combined brand and model name"),
  brand: z.string(),
  model: z.string(),
  category: z.string(),
  specifications: z.string().optional().describe("Detailed specifications text if available"),
  features: z.record(z.string(), z.union([z.string(), z.boolean(), z.number()])).optional().describe("e.g., { speed: '40km/h', tankCleaner: true }"),
  tankSize: z.string().optional(),
  acresCapacityPerDay: z.number().optional(),
  pricePerAcre: z.number().optional(),
  pricePerDay: z.number().optional(),
  pricePerHour: z.number().optional(),
  // offDays: z.array(z.string()).optional().describe("Array of YYYY-MM-DD strings when equipment is off"),
  // availableDays: z.array(z.string()).optional().describe("Array of specific available dates or recurring day names"),
  availabilityStatus: z.enum(["available", "unavailable", "maintenance"]), // Your Firestore 'availability' field
  batteriesAvailable: z.number().optional(),
  rating: z.number().optional().min(0).max(5),
  // reviews: z.array(z.object({ rating: z.number(), comment: z.string() })).optional(), // Or link to reviews API
  images: z.array(z.string().url()).optional().describe("Array of image URLs"),
  videoUrl: z.string().url().optional(),
  location: z.object({ // Equipment specific location if different from vendor
    lat: z.number(),
    lon: z.number(),
    address: z.string().optional(),
  }).optional(),
  yieldIncreaseBenefit: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { vendorId: string; equipmentId: string } }
) {
  try {
    const { vendorId, equipmentId } = params;

    if (!vendorId || !equipmentId) {
      return NextResponse.json({ error: 'Vendor ID and Equipment ID are required' }, { status: 400 });
    }

    // --- Firestore Data Fetching Logic (Placeholder) ---
    // if (!db) {
    //   return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 });
    // }
    //
    // const equipmentDocRef = db.collection('vendor').doc(vendorId)
    //                             .collection('VendorEquipments').doc(equipmentId);
    // const equipmentDoc = await equipmentDocRef.get();
    //
    // if (!equipmentDoc.exists) {
    //   return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    // }
    // const equipmentData = equipmentDoc.data() as any; // Cast to 'any' or a defined Firestore type
    //
    // // Fetch vendor data for vendorName if needed
    // let vendorName;
    // const vendorDoc = await db.collection('vendor').doc(vendorId).get();
    // if (vendorDoc.exists) {
    //   vendorName = vendorDoc.data()?.vendorName;
    // }
    //
    // const responseData = {
    //   equipmentId: equipmentDoc.id,
    //   vendorId: vendorId,
    //   vendorName: vendorName,
    //   name: `${equipmentData.brand} ${equipmentData.model}`,
    //   brand: equipmentData.brand,
    //   model: equipmentData.model,
    //   category: equipmentData.category,
    //   // Map other fields carefully based on your Firestore structure and DetailedEquipmentSchema
    //   specifications: equipmentData.specifications, // Assuming you add this field
    //   features: equipmentData.feature, // Your Firestore 'feature' map
    //   tankSize: equipmentData.tankSize,
    //   acresCapacityPerDay: equipmentData.acresCapacityPerDay,
    //   pricePerAcre: equipmentData.pricePerAcre,
    //   pricePerDay: equipmentData.pricePerDay,
    //   pricePerHour: equipmentData.pricePerHour, // Assuming you add this
    //   availabilityStatus: equipmentData.availability,
    //   batteriesAvailable: equipmentData.batteriesAvailable,
    //   rating: equipmentData.rating, // Assuming this is an aggregated rating
    //   images: equipmentData.images,
    //   videoUrl: equipmentData.videoUrl, // Assuming you add this
    //   yieldIncreaseBenefit: equipmentData.yieldIncreaseBenefit, // Assuming this exists from previous work
    //   location: equipmentData.Location ? { lat: equipmentData.Location.lat, lon: equipmentData.Location.long } : undefined,
    // };
    // --- End of Firestore Logic Placeholder ---


    // Mock data for a specific drone, matching the farmer app's likely needs
    // This should correspond to an item that could be returned by the /api/vendors endpoint
    if (vendorId === "vendor_12345xyz" && equipmentId === "drone_abc_789") {
      const mockEquipmentDetail: z.infer<typeof DetailedEquipmentSchema> = {
        equipmentId: "drone_abc_789",
        vendorId: "vendor_12345xyz",
        vendorName: "Samadhan Patil Krishi Seva Kendra",
        name: "Krishi Samrat Drone",
        brand: "Krishi", // From your Firestore structure
        model: "Samrat Drone", // From your Firestore structure
        category: "Drone Service",
        specifications: "High precision agricultural drone with 10L tank, advanced GPS, and obstacle avoidance. Covers up to 15 acres per hour efficiently. Suitable for pesticide, herbicide, and fertilizer spraying.",
        features: {
          speed: "Up to 10 m/s",
          tankCleaner: true,
          sprayWidth: "4-6 meters"
        },
        tankSize: "10L",
        acresCapacityPerDay: 100, // Example
        pricePerAcre: 480, // 12 * 40 (assuming Guntha from screenshot)
        availabilityStatus: "available",
        batteriesAvailable: 4,
        rating: 4.3,
        images: ["https://placehold.co/600x400.png?text=Krishi+Drone+Detail1", "https://placehold.co/600x400.png?text=Krishi+Drone+Detail2"],
        videoUrl: "https://www.youtube.com/watch?v=examplevideo_drone",
        yieldIncreaseBenefit: "Precise application reduces chemical wastage and ensures even coverage, enhancing crop health and yield by up to 15%.",
        location: { // Example equipment-specific location if available
            lat: 18.5204, // Pune
            lon: 73.8567,
            address: "Field A, Near Pune City"
        }
      };
      const response = DetailedEquipmentSchema.parse(mockEquipmentDetail);
      return NextResponse.json(response);
    }

    return NextResponse.json({ error: 'Equipment not found in mock data' }, { status: 404 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid response data structure', details: error.issues }, { status: 500 });
    }
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
