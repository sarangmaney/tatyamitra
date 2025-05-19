import { db } from './firebase'; 
import { collection, addDoc } from "firebase/firestore";

interface PilotData {
  name: string;
  phone: string;
  droneModel: string;
  totalFlights: number;
  isCertified: boolean;
  createdAt: Date;
}

async function addPilotWithNewVendor(pilotData: PilotData) {
  try {
    // Create a new vendor document with a Firestore-generated ID
    const vendorsCollectionRef = collection(db, "vendor");
    const newVendorRef = await addDoc(vendorsCollectionRef, {
      // You can add other vendor-specific fields here if needed
      vendorName: pilotData.name, // Using pilot's name as a placeholder vendor name
      createdAt: new Date()
    });

    // Add the pilot data to the 'pilots' subcollection under the new vendor document
    const pilotsCollectionRef = collection(newVendorRef, "pilots");
    await addDoc(pilotsCollectionRef, pilotData);

    console.log("Pilot data added successfully under new vendor:", newVendorRef.id);
  } catch (e) {
    console.error("Error adding pilot data with new vendor: ", e);
  }
}

export { addPilotWithNewVendor };