
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
// import { db, GeoPoint } from '@/lib/firebase-admin'; // Uncomment when ready for Firestore

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
  rating: z.number().optional().min(0).max(5),
  tankSize: z.string().optional().describe("e.g., '10L', '16L' for drones"),
  acresCapacityPerDay: z.number().optional(),
  primaryImageUrl: z.string().url().optional(),
  status: z.enum(["available", "unavailable", "maintenance"]),
});

// Define Zod schema for the vendor item in the response
const VendorResponseItemSchema = z.object({
  vendorId: z.string(),
  vendorName: z.string(),
  location: z.object({
    district: z.string(),
    taluka: z.string().optional(),
    // coordinates: z.object({ lat: z.number(), lon: z.number() }).optional(), // For GeoPoint
  }),
  profileImageUri: z.string().url().optional(),
  serviceableRadiusKm: z.number().optional(),
  equipments: z.array(EquipmentItemSchema).optional().describe("List of relevant equipments offered by the vendor."),
});

export const VendorListResponseSchema = z.array(VendorResponseItemSchema);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryParams = Object.fromEntries(searchParams.entries());

  try {
    const validatedQuery = VendorQuerySchema.parse(queryParams);
    const { pincode, equipmentCategory, lat, lon, radius } = validatedQuery;

    // --- Firestore Data Fetching Logic (Placeholder) ---
    // if (!db) {
    //   return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 });
    // }
    //
    // let query: admin.firestore.Query = db.collection('vendor');
    //
    // if (pincode) {
    //   // Assuming pincode is part of a structured location field or a direct field.
    //   // This might require a composite index on `location.pincode` if it's nested.
    //   // For simplicity, let's assume vendor documents have a top-level `pincode` field
    //   // or `location.pincode`. Adjust based on your actual structure.
    //   // query = query.where('pincode', '==', pincode);
    // }
    //
    // // Geospatial filtering (lat, lon, radius) is complex with Firestore alone.
    // // It typically requires a third-party solution (e.g., Geofire for Realtime Database,
    // // or external services like Algolia/Elasticsearch) or client-side filtering on a
    // // broader dataset fetched by district/taluka first.
    // // This example will not implement full geospatial querying.
    //
    // const vendorSnapshots = await query.get();
    // let vendorsData = vendorSnapshots.docs.map(doc => ({ vendorId: doc.id, ...doc.data() as any }));
    //
    // // If equipmentCategory is specified, filter vendors and their equipment
    // if (equipmentCategory) {
    //   const filteredVendors = [];
    //   for (const vendor of vendorsData) {
    //     const equipmentSnapshot = await db.collection('vendor').doc(vendor.vendorId)
    //                                   .collection('VendorEquipments')
    //                                   .where('category', '==', equipmentCategory)
    //                                   .get();
    //     const equipments = equipmentSnapshot.docs.map(eqDoc => {
    //       const eqData = eqDoc.data();
    //       return {
    //         equipmentId: eqDoc.id,
    //         name: `${eqData.brand} ${eqData.model}`,
    //         category: eqData.category,
    //         // Map other fields from eqData to EquipmentItemSchema
    //         pricePerAcre: eqData.pricePerAcre,
    //         status: eqData.availability, // Assuming 'availability' maps to 'status'
    //         primaryImageUrl: eqData.images && eqData.images.length > 0 ? eqData.images[0] : undefined,
    //         // ... other fields
    //       };
    //     });
    //
    //     if (equipments.length > 0) {
    //       filteredVendors.push({
    //         ...vendor,
    //         equipments,
    //         location: { // Reconstruct location from your Firestore structure
    //           district: vendor.location?.district || 'Unknown District',
    //           taluka: vendor.location?.taluka
    //         }
    //       });
    //     }
    //   }
    //   vendorsData = filteredVendors;
    // } else {
    //   // If no equipment category, you might still want to fetch a summary of equipment or none
    //   // For simplicity, this mock won't fetch all equipment for all vendors if no category is specified.
    //    vendorsData = vendorsData.map(v => ({
    //      ...v,
    //      location: { district: v.location?.district || 'N/A', taluka: v.location?.taluka }
    //    }));
    // }
    // --- End of Firestore Logic Placeholder ---


    // Mock data based on your screenshot and structure
    const mockVendors = [
      {
        vendorId: "vendor_12345xyz",
        vendorName: "Samadhan Patil Krishi Seva Kendra", // "समाधान पाटील"
        location: {
          district: "Pune", // "पुणे"
          taluka: "Haveli",
        },
        profileImageUri: "https://placehold.co/100x100.png?text=SP", // Placeholder for "समाधान पाटील"
        serviceableRadiusKm: 20,
        equipments: equipmentCategory === "Drone Service" || !equipmentCategory ? [
          {
            equipmentId: "drone_abc_789",
            name: "Krishi Samrat Drone", // "कृषी सम्राट ड्रोन"
            category: "Drone Service",
            pricePerAcre: 12, // Assuming the "₹12 /गुंठा" means per Guntha. 1 Acre = 40 Guntha. So ~480/acre. Let's use a simplified per-unit price for now.
            // For API consistency, maybe stick to pricePerAcre, pricePerHour, or pricePerDay.
            // If "₹12 /गुंठा" is the display unit, the client app will handle it.
            // Let's assume price is per some unit like acre for the API.
            // pricePerUnit: 12, unit: "Guntha" - this is another option
            pricePerAcre: 480, // Mocked: 12 * 40
            rating: 4.3,
            tankSize: "10L", // "१० लि"
            // acresCapacityPerDay: (provided in your Firestore structure)
            primaryImageUrl: "https://placehold.co/600x400.png?text=Krishi+Drone",
            status: "available" as const,
          }
        ] : [],
      },
      // Add more mock vendors if needed, especially for different pincodes/categories
      {
        vendorId: "vendor_67890abc",
        vendorName: "AgroTech Solutions",
        location: {
          district: "Satara",
          taluka: "Karad",
        },
        profileImageUri: "https://placehold.co/100x100.png?text=AS",
        serviceableRadiusKm: 25,
        equipments: equipmentCategory === "Tractor" || !equipmentCategory ? [
          {
            equipmentId: "tractor_def_123",
            name: "Mahindra Tractor 575",
            category: "Tractor",
            pricePerHour: 600,
            rating: 4.5,
            primaryImageUrl: "https://placehold.co/600x400.png?text=Tractor",
            status: "available" as const,
          }
        ] : [],
      }
    ];

    // Simulate filtering based on query params for mock data
    let finalVendors = mockVendors;
    if (pincode) {
      // This is a very basic mock filter. Real pincode filtering would depend on your data.
      if (pincode === "411001" /* Pune example */) {
        finalVendors = mockVendors.filter(v => v.location.district === "Pune");
      } else if (pincode === "415110" /* Karad example */) {
         finalVendors = mockVendors.filter(v => v.location.district === "Satara");
      } else {
        finalVendors = []; // No match for other pincodes in mock
      }
    }

    if (equipmentCategory) {
      finalVendors = finalVendors.map(v => ({
        ...v,
        equipments: v.equipments?.filter(e => e.category === equipmentCategory)
      })).filter(v => v.equipments && v.equipments.length > 0);
    }


    const response = VendorListResponseSchema.parse(finalVendors);
    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
    }
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
