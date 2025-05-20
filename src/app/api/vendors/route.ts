
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/firebase-admin'; // Ensure Firebase Admin is initialized
import type { FirebaseError } from 'firebase-admin/app'; // For type hinting Firestore errors
import type admin from 'firebase-admin'; // For Firestore query types

// Define Zod schema for query parameters
const VendorQuerySchema = z.object({
  pincode: z.string().optional().describe("Pincode to filter vendors by."),
  lat: z.coerce.number().optional().describe("Latitude for geospatial search."),
  lon: z.coerce.number().optional().describe("Longitude for geospatial search."),
  radius: z.coerce.number().optional().describe("Radius in kilometers for geospatial search."),
  equipmentCategory: z.string().optional().describe("Category of equipment to filter by (e.g., 'Drone Service', 'Tractor').")
});

// Define Zod schema for the equipment item in the response
const EquipmentItemSchema = z.object({
  equipmentId: z.string(),
  name: z.string().describe("Combined brand and model name, e.g., 'Mahindra JIVO 245 DI'"),
  category: z.string(),
  pricePerAcre: z.number().optional(),
  pricePerDay: z.number().optional(),
  pricePerHour: z.number().optional(),
  rating: z.number().min(0).max(5).optional(), // Corrected: .min().max() before .optional()
  tankSize: z.string().optional().describe("e.g., '10L', '16L' for drones"),
  acresCapacityPerDay: z.number().optional(),
  primaryImageUrl: z.string().url().optional(),
  status: z.enum(["available", "unavailable", "maintenance"]),
});
export type EquipmentItem = z.infer<typeof EquipmentItemSchema>;

// Define Zod schema for the vendor item in the response
const VendorResponseItemSchema = z.object({
  vendorId: z.string(),
  vendorName: z.string(),
  location: z.object({
    district: z.string(),
    taluka: z.string().optional(),
  }),
  profileImageUri: z.string().url().optional(),
  serviceableRadiusKm: z.number().optional(),
  equipments: z.array(EquipmentItemSchema).optional().describe("List of relevant equipments offered by the vendor."),
});
export type VendorResponseItem = z.infer<typeof VendorResponseItemSchema>;

export const VendorListResponseSchema = z.array(VendorResponseItemSchema);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryParams = Object.fromEntries(searchParams.entries());

  try {
    const validatedQuery = VendorQuerySchema.parse(queryParams);
    const { pincode, equipmentCategory, lat, lon, radius } = validatedQuery;

    // If Firebase Admin is not initialized (e.g., missing credentials), db will be null.
    // Fallback to mock data if db is not available.
    if (!db) {
      console.warn('Firestore not initialized, serving mock data for /api/vendors');
      const mockVendors = [
        {
          vendorId: "vendor_12345xyz",
          vendorName: "Samadhan Patil Krishi Seva Kendra",
          location: { district: "Pune", taluka: "Haveli" },
          profileImageUri: "https://placehold.co/100x100.png",
          serviceableRadiusKm: 20,
          equipments: equipmentCategory === "Drone Service" || !equipmentCategory ? [
            {
              equipmentId: "drone_abc_789",
              name: "Krishi Samrat Drone",
              category: "Drone Service",
              pricePerAcre: 480,
              rating: 4.3,
              tankSize: "10L",
              primaryImageUrl: "https://placehold.co/600x400.png",
              status: "available" as const,
            }
          ] : [],
        },
        {
          vendorId: "vendor_67890abc",
          vendorName: "AgroTech Solutions",
          location: { district: "Satara", taluka: "Karad" },
          profileImageUri: "https://placehold.co/100x100.png",
          serviceableRadiusKm: 25,
          equipments: equipmentCategory === "Tractor" || !equipmentCategory ? [
            {
              equipmentId: "tractor_def_123",
              name: "Mahindra Tractor 575",
              category: "Tractor",
              pricePerHour: 600,
              rating: 4.5,
              primaryImageUrl: "https://placehold.co/600x400.png",
              status: "available" as const,
            }
          ] : [],
        }
      ];
      let finalMockVendors = mockVendors;
      if (pincode) {
        if (pincode === "411001") finalMockVendors = mockVendors.filter(v => v.location.district === "Pune");
        else if (pincode === "415110") finalMockVendors = mockVendors.filter(v => v.location.district === "Satara");
        else finalMockVendors = [];
      }
      if (equipmentCategory) {
        finalMockVendors = finalMockVendors.map(v => ({
          ...v,
          equipments: v.equipments?.filter(e => e.category === equipmentCategory)
        })).filter(v => v.equipments && v.equipments.length > 0);
      }
      const parsedMockResponse = VendorListResponseSchema.parse(finalMockVendors);
      return NextResponse.json(parsedMockResponse);
    }

    // Real Firestore logic
    let vendorQuery: admin.firestore.Query = db.collection('vendor');

    // Basic filtering example (more complex filtering like by pincode directly on nested location
    // or geospatial queries might require different data structures or Cloud Functions)
    if (pincode) {
      // This is a simplified example; direct pincode query on a nested map might not be efficient.
      // You might have a top-level 'pincodes' collection or denormalize pincode.
      // For now, this will query all vendors and filter client-side if not indexed, which is not ideal for large datasets.
      // vendorQuery = vendorQuery.where('location.pincode', '==', pincode); // Example if pincode was directly under location
    }
    // Note: Radius-based filtering (lat, lon, radius) is complex with Firestore alone and usually requires
    // server-side calculation (e.g., in a Cloud Function) or a specialized geo-query service.

    const vendorSnapshots = await vendorQuery.get();
    const vendorsDataFromDb: VendorResponseItem[] = [];

    for (const vendorDoc of vendorSnapshots.docs) {
      const vendorData = vendorDoc.data();
      
      // Example: If pincode filtering is done post-fetch (not recommended for large scale)
      if (pincode && vendorData.pincode !== pincode && vendorData.location?.pincode !== pincode) {
         // Simple check, adjust based on your actual structure (e.g. vendorData.pincode or vendorData.location.pincode)
        continue;
      }

      let equipmentQuery: admin.firestore.Query = db.collection('vendor').doc(vendorDoc.id).collection('VendorEquipments');
      if (equipmentCategory) {
        equipmentQuery = equipmentQuery.where('category', '==', equipmentCategory);
      }
      const equipmentSnapshots = await equipmentQuery.get();
      
      const equipmentsList: EquipmentItem[] = equipmentSnapshots.docs.map(eqDoc => {
        const eqData = eqDoc.data();
        return {
          equipmentId: eqDoc.id,
          name: `${eqData.brand || ''} ${eqData.model || ''}`.trim(),
          category: eqData.category || 'Unknown Category',
          pricePerAcre: eqData.pricePerAcre,
          pricePerDay: eqData.pricePerDay,
          pricePerHour: eqData.pricePerHour,
          rating: eqData.rating,
          tankSize: eqData.tankSize,
          acresCapacityPerDay: eqData.acresCapacityPerDay,
          primaryImageUrl: eqData.images && eqData.images.length > 0 ? eqData.images[0] : `https://placehold.co/600x400.png`,
          status: eqData.availability || 'unavailable',
        };
      });

      // Only add vendor if they have matching equipment (if category is specified) or if no category filter.
      if (!equipmentCategory || (equipmentCategory && equipmentsList.length > 0)) {
        vendorsDataFromDb.push({
          vendorId: vendorDoc.id,
          vendorName: vendorData.vendorName || 'Unknown Vendor',
          location: {
            district: vendorData.district || vendorData.location?.district || 'Unknown District', // Check top level then nested
            taluka: vendorData.taluka || vendorData.location?.taluka,
          },
          profileImageUri: vendorData.profileImageUri || 'https://placehold.co/100x100.png',
          serviceableRadiusKm: vendorData.serviceableRadius,
          equipments: equipmentsList.length > 0 ? equipmentsList : undefined,
        });
      }
    }

    const parsedResponse = VendorListResponseSchema.parse(vendorsDataFromDb);
    return NextResponse.json(parsedResponse);

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod Validation Error (API /api/vendors):", error.issues);
      return NextResponse.json({ error: 'Invalid data structure or query parameters', details: error.issues }, { status: 400 });
    }
    const firebaseError = error as FirebaseError;
    if (firebaseError.code) {
      console.error("Firestore Error (API /api/vendors):", firebaseError);
      return NextResponse.json({ error: 'Error fetching data from Firestore', details: firebaseError.message }, { status: 500 });
    }
    console.error("API Error (API /api/vendors):", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
