
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/firebase-admin'; // Ensure Firebase Admin is initialized
import type { FirebaseError } from 'firebase-admin/app'; // For type hinting Firestore errors

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
  availabilityStatus: z.enum(["available", "unavailable", "maintenance"]),
  batteriesAvailable: z.number().optional(),
  rating: z.number().min(0).max(5).optional(), // Corrected: .min().max() before .optional()
  images: z.array(z.string().url()).optional().describe("Array of image URLs"),
  videoUrl: z.string().url().optional(),
  location: z.object({
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

    if (!db) {
      console.warn(`Firestore not initialized, serving mock data for /api/vendors/${vendorId}/equipment/${equipmentId}`);
      if (vendorId === "vendor_12345xyz" && equipmentId === "drone_abc_789") {
        const mockEquipmentDetail: z.infer<typeof DetailedEquipmentSchema> = {
          equipmentId: "drone_abc_789",
          vendorId: "vendor_12345xyz",
          vendorName: "Samadhan Patil Krishi Seva Kendra",
          name: "Krishi Samrat Drone",
          brand: "Krishi",
          model: "Samrat Drone",
          category: "Drone Service",
          specifications: "High precision agricultural drone with 10L tank, advanced GPS, and obstacle avoidance. Covers up to 15 acres per hour efficiently. Suitable for pesticide, herbicide, and fertilizer spraying.",
          features: { speed: "Up to 10 m/s", tankCleaner: true, sprayWidth: "4-6 meters" },
          tankSize: "10L",
          acresCapacityPerDay: 100,
          pricePerAcre: 480,
          availabilityStatus: "available",
          batteriesAvailable: 4,
          rating: 4.3,
          images: ["https://placehold.co/600x400.png", "https://placehold.co/600x400.png"],
          videoUrl: "https://www.youtube.com/watch?v=examplevideo_drone",
          yieldIncreaseBenefit: "Precise application reduces chemical wastage and ensures even coverage, enhancing crop health and yield by up to 15%.",
          location: { lat: 18.5204, lon: 73.8567, address: "Field A, Near Pune City" }
        };
        const parsedMockResponse = DetailedEquipmentSchema.parse(mockEquipmentDetail);
        return NextResponse.json(parsedMockResponse);
      }
      return NextResponse.json({ error: 'Equipment not found in mock data' }, { status: 404 });
    }

    const equipmentDocRef = db.collection('vendor').doc(vendorId)
                                .collection('VendorEquipments').doc(equipmentId);
    const equipmentDoc = await equipmentDocRef.get();

    if (!equipmentDoc.exists) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }
    const equipmentData = equipmentDoc.data();
    
    if (!equipmentData) {
        return NextResponse.json({ error: 'Equipment data is missing' }, { status: 404 });
    }

    let vendorName;
    const vendorDoc = await db.collection('vendor').doc(vendorId).get();
    if (vendorDoc.exists) {
      vendorName = vendorDoc.data()?.vendorName;
    }
    
    const responseData: z.infer<typeof DetailedEquipmentSchema> = {
      equipmentId: equipmentDoc.id,
      vendorId: vendorId,
      vendorName: vendorName || 'Unknown Vendor',
      name: `${equipmentData.brand || ''} ${equipmentData.model || ''}`.trim(),
      brand: equipmentData.brand || 'Unknown Brand',
      model: equipmentData.model || 'Unknown Model',
      category: equipmentData.category || 'Unknown Category',
      specifications: equipmentData.specifications,
      features: equipmentData.feature,
      tankSize: equipmentData.tankSize,
      acresCapacityPerDay: equipmentData.acresCapacityPerDay,
      pricePerAcre: equipmentData.pricePerAcre,
      pricePerDay: equipmentData.pricePerDay,
      pricePerHour: equipmentData.pricePerHour,
      availabilityStatus: equipmentData.availability || 'unavailable',
      batteriesAvailable: equipmentData.batteriesAvailable,
      rating: equipmentData.rating,
      images: equipmentData.images || [],
      videoUrl: equipmentData.videoUrl,
      yieldIncreaseBenefit: equipmentData.yieldIncreaseBenefit,
      location: equipmentData.Location ? { 
        lat: equipmentData.Location.latitude,
        lon: equipmentData.Location.longitude,
        address: equipmentData.Location.address
      } : undefined,
    };
    
    const response = DetailedEquipmentSchema.parse(responseData);
    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`Zod Validation Error (API /api/vendors/[vendorId]/equipment/[equipmentId]):`, error.issues);
      return NextResponse.json({ error: 'Invalid response data structure', details: error.issues }, { status: 500 });
    }
    const firebaseError = error as FirebaseError;
    if (firebaseError.code) {
      console.error("Firestore Error (API /api/vendors/[vendorId]/equipment/[equipmentId]):", firebaseError);
      return NextResponse.json({ error: 'Error fetching data from Firestore', details: firebaseError.message }, { status: 500 });
    }
    console.error("API Error (API /api/vendors/[vendorId]/equipment/[equipmentId]):", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
