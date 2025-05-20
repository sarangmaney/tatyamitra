
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Camera, UploadCloud, PartyPopper } from 'lucide-react';

// Firebase imports - uncomment and use when implementing submission
// import { db } from '@/lib/firebase';
// import { collection, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';

const initialFormData = {
  createdAt: new Date().toISOString(),
  kyc: 'Pending', // Default KYC status
  lastLogin: new Date().toISOString(),
  location: {
    district: '',
    taluka: '',
    lat: '',
    long: '',
  },
  ownerName: '',
  vendorName: '',
  pincode: '',
  profileImageUri: '', // Will store preview URL or actual uploaded URL
  serviceableRadius: 100, // Default value
  // Equipment fields
  model: '',
  brand: '',
  category: 'Spraying Drone', // Default category
  tankSize: '',
  batteriesAvailable: 0,
  equipmentImages: [] as string[], // Will store preview URLs or actual uploaded URLs
  feature: {
    Speed: '', // Note: Consider consistent casing e.g., speed
    tankCleaner: 'No', // Default to No, can be 'Yes'
  },
  acresCapacityPerDay: 0,
  pricePerAcre: 0,
  pricePerDay: 0, // Will be calculated
  unit: 'Per Acre', // Default unit
  // Service details
  travelMode: 'Own Vehicle', // Default
  availableDays: [] as string[],
  preferredTime: '',
  servicesExpected: 'All of the above', // Default
  vendorId: '', // Will be set after vendor creation or use a UUID
};

type FormData = typeof initialFormData;

export function VendorEquipmentForm() {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const { toast } = useToast();

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNested = (section: 'location' | 'feature', key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleCaptureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateNested('location', 'lat', pos.coords.latitude.toString());
          updateNested('location', 'long', pos.coords.longitude.toString());
          toast({ title: 'Location Captured', description: `Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)}` });
        },
        (error) => {
          console.error("Error capturing location:", error);
          toast({ variant: 'destructive', title: 'Location Error', description: 'Could not capture location. Please enter manually.' });
        }
      );
    } else {
      toast({ variant: 'destructive', title: 'Location Error', description: 'Geolocation is not supported by your browser.' });
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'profileImageUri' | 'equipmentImages', isMultiple = false) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (isMultiple) {
        const fileUrls = Array.from(files).map(file => URL.createObjectURL(file));
        // In a real app, you'd upload these files and store their storage URLs.
        // For now, storing preview URLs. You might want to manage File objects for upload.
        updateField(fieldName, fileUrls as any); 
      } else {
        // For single file (profile image)
        const fileUrl = URL.createObjectURL(files[0]);
        updateField(fieldName, fileUrl as any);
      }
    }
  };


  const nextStep = () => {
    // Basic validation example for step 1
    if (step === 1) {
      if (!formData.ownerName || !formData.vendorName || !formData.location.district || !formData.location.taluka || !formData.pincode) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill all fields in Vendor Info.' });
        return;
      }
    }
    // Drone capacity validation when moving from step 2 to 3
    if (step === 2) { 
      // No specific validation here, moved to handleSubmit for final check
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const StepCircle = ({ number, currentStep }: { number: number; currentStep: number }) => (
    <div className="flex items-center">
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold transition-all
          ${currentStep === number ? 'bg-primary text-primary-foreground border-primary' : 
          number < currentStep ? 'bg-green-500 text-white border-green-500' : 
          'text-muted-foreground border-border'}`}
      >
        {number}
      </div>
      {number < 3 && <div className={`h-1 flex-1 ${number < currentStep ? 'bg-green-500' : 'bg-border'} mx-2 max-w-10`} />}
    </div>
  );

  const handleSubmit = async () => {
    // Drone capacity validation
    if (formData.category === 'Spraying Drone' && formData.acresCapacityPerDay > 0) {
        const timePerDayHours = formData.preferredTime === 'Morning' ? 3 : formData.preferredTime === 'Evening' ? 3 : (formData.preferredTime === 'Both' ? 6 : 6) ; // Default to 6 if "Any Time" or "Both"
        const maxAcres = 5 * timePerDayHours; 
        if (formData.acresCapacityPerDay > maxAcres) {
          toast({
            variant: 'destructive',
            title: 'Capacity Exceeded',
            description: `For ${formData.preferredTime || 'selected working hours'}, max capacity is ${maxAcres} acres. Reduce acres or adjust working hours.`,
          });
          return;
        }
    }

    const calculatedPricePerDay = formData.acresCapacityPerDay * formData.pricePerAcre;
    const finalFormData: FormData = {
      ...formData,
      pricePerDay: calculatedPricePerDay,
      vendorId: 'vendor_' + Date.now(), // Temporary ID generation
      createdAt: new Date().toISOString(), // Ensure it's current
      lastLogin: new Date().toISOString(), // Ensure it's current
    };
    
    console.log("Form Data to Submit:", finalFormData);

    // --- TODO: Firebase Submission Logic ---
    // try {
    //   // 1. Create Vendor Document
    //   const vendorDataToSubmit = {
    //     ownerName: finalFormData.ownerName,
    //     vendorName: finalFormData.vendorName,
    //     location: {
    //       district: finalFormData.location.district,
    //       taluka: finalFormData.location.taluka,
    //       // coordinates: new GeoPoint(parseFloat(finalFormData.location.lat) || 0, parseFloat(finalFormData.location.long) || 0), // If lat/long are guaranteed
    //       pincode: finalFormData.pincode,
    //     },
    //     // profileImageUri: "URL after upload", // Actual URL from Firebase Storage
    //     serviceableRadius: finalFormData.serviceableRadius,
    //     createdAt: serverTimestamp(),
    //     lastLogin: serverTimestamp(),
    //     kyc: finalFormData.kyc,
    //     // Add other vendor specific fields from finalFormData if any
    //   };
    //   // if (finalFormData.location.lat && finalFormData.location.long) { // Add coordinates only if available
    //   //   (vendorDataToSubmit.location as any).coordinates = new GeoPoint(parseFloat(finalFormData.location.lat), parseFloat(finalFormData.location.long));
    //   // }
    //   // const vendorRef = await addDoc(collection(db, "vendor"), vendorDataToSubmit);
    //   // const newVendorId = vendorRef.id;

    //   // 2. Create Equipment Document in Subcollection
    //   // const equipmentDataToSubmit = {
    //   //   vendorId: newVendorId, // Link to the vendor
    //   //   brand: finalFormData.brand,
    //   //   model: finalFormData.model,
    //   //   category: finalFormData.category,
    //   //   tankSize: finalFormData.tankSize,
    //   //   batteriesAvailable: finalFormData.batteriesAvailable,
    //   //   // images: ["URL(s) after upload"], // Actual URLs from Firebase Storage
    //   //   feature: finalFormData.feature,
    //   //   acresCapacityPerDay: finalFormData.acresCapacityPerDay,
    //   //   pricePerAcre: finalFormData.pricePerAcre,
    //   //   pricePerDay: finalFormData.pricePerDay, // Calculated
    //   //   unit: finalFormData.unit,
    //   //   travelMode: finalFormData.travelMode,
    //   //   availableDays: finalFormData.availableDays,
    //   //   preferredTime: finalFormData.preferredTime,
    //   //   createdAt: serverTimestamp(),
    //   // };
    //   // await addDoc(collection(db, "vendor", newVendorId, "VendorEquipments"), equipmentDataToSubmit);

    //   toast({ title: 'Registration Successful!', description: 'Your information has been submitted.'});
    //   setShowSuccess(true);
    // } catch (error) {
    //   console.error("Error submitting form:", error);
    //   toast({ variant: 'destructive', title: 'Submission Error', description: 'Could not submit your information. Please try again.'});
    // }
    // --- End of Firebase Submission Logic Placeholder ---
    
    // For now, just show success without Firebase
    toast({ title: 'Registration Submitted (Simulated)!', description: 'Your information would be sent to the server here.'});
    setShowSuccess(true);
  };


  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="text-center">
        <div className="text-sm font-semibold text-primary mb-4 p-3 bg-primary/10 rounded-md">
          {step === 1 && 'Our partners increased income by ₹50,000/month with Tatya Mitra!'}
          {step === 2 && 'Equipment listed here often gets ₹2.5L+ in rentals per year.'}
          {step === 3 && 'Complete setup & join the AgriTech renting revolution!'}
        </div>
        <div className="flex justify-center my-6">
          {[1, 2, 3].map((num) => (
            <StepCircle key={num} number={num} currentStep={step} />
          ))}
        </div>
        <CardTitle className="text-2xl">
          {step === 1 && 'Vendor Information'}
          {step === 2 && 'Equipment Details'}
          {step === 3 && 'Service & Pricing'}
        </CardTitle>
        <CardDescription>
            {step === 1 && 'Tell us about yourself and your business.'}
            {step === 2 && 'Describe the equipment you want to list.'}
            {step === 3 && 'Set your service availability and pricing.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input id="ownerName" placeholder="e.g., Suresh Patil" value={formData.ownerName} onChange={(e) => updateField('ownerName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendorName">Vendor/Center Name</Label>
              <Input id="vendorName" placeholder="e.g., Patil Krishi Seva Kendra" value={formData.vendorName} onChange={(e) => updateField('vendorName', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input id="district" value={formData.location.district} onChange={(e) => updateNested('location', 'district', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taluka">Taluka</Label>
                <Input id="taluka" value={formData.location.taluka} onChange={(e) => updateNested('location', 'taluka', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" type="tel" maxLength={6} value={formData.pincode} onChange={(e) => updateField('pincode', e.target.value)} />
            </div>
             <Button variant="outline" onClick={handleCaptureLocation} className="w-full">
              <MapPin className="mr-2 h-4 w-4" /> Capture Current Location (Lat/Long)
            </Button>
            {formData.location.lat && formData.location.long && (
              <p className="text-xs text-muted-foreground text-center">
                Captured: Lat: {parseFloat(formData.location.lat).toFixed(4)}, Long: {parseFloat(formData.location.long).toFixed(4)}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="profileImageUriInput">Upload Profile Photo</Label>
              <div className="flex items-center gap-2">
                <UploadCloud className="h-6 w-6 text-muted-foreground" />
                <Input id="profileImageUriInput" type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange(e, 'profileImageUri')} className="flex-1" />
              </div>
              {formData.profileImageUri && <img src={formData.profileImageUri} alt="Profile Preview" className="mt-2 h-24 w-24 object-cover rounded-md border" />}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="category">Equipment Type</Label>
              <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                <SelectTrigger id="category"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spraying Drone">Spraying Drone</SelectItem>
                  <SelectItem value="Seeding Drone">Seeding Drone</SelectItem>
                  <SelectItem value="Survey Drone">Survey Drone</SelectItem>
                  <SelectItem value="Tractor">Tractor</SelectItem>
                  <SelectItem value="Harvester">Harvester</SelectItem>
                  <SelectItem value="Rotavator">Rotavator</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" placeholder="e.g., DJI, Mahindra" value={formData.brand} onChange={(e) => updateField('brand', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" placeholder="e.g., Agras T30, Arjun 555" value={formData.model} onChange={(e) => updateField('model', e.target.value)} />
            </div>
            {formData.category.toLowerCase().includes('drone') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tankSize">Tank Size (Liters, for Drones)</Label>
                  <Input id="tankSize" placeholder="e.g., 10L, 16L" value={formData.tankSize} onChange={(e) => updateField('tankSize', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batteriesAvailable">Number of Batteries</Label>
                  <Input id="batteriesAvailable" type="number" value={formData.batteriesAvailable} onChange={(e) => updateField('batteriesAvailable', Number(e.target.value))} />
                </div>
              </>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="featureSpeed">Max Speed (optional)</Label>
                    <Input id="featureSpeed" placeholder="e.g., 10 m/s" value={formData.feature.Speed} onChange={(e) => updateNested('feature', 'Speed', e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="featureTankCleaner">Tank Cleaner (Drones)</Label>
                     <Select value={formData.feature.tankCleaner} onValueChange={(value) => updateNested('feature', 'tankCleaner', value as string)}>
                        <SelectTrigger id="featureTankCleaner"><SelectValue placeholder="Has tank cleaner?" /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipmentImagesInput">Upload Equipment Photo(s)</Label>
               <div className="flex items-center gap-2">
                <Camera className="h-6 w-6 text-muted-foreground" />
                <Input id="equipmentImagesInput" type="file" accept="image/*" multiple capture="environment" onChange={(e) => handleFileChange(e, 'equipmentImages', true)} className="flex-1" />
              </div>
              {formData.equipmentImages.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {formData.equipmentImages.map((src, index) => (
                    <img key={index} src={src} alt={`Equipment Preview ${index + 1}`} className="h-24 w-24 object-cover rounded-md border" />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="acresCapacityPerDay">Acres Capacity Per Day</Label>
              <Input id="acresCapacityPerDay" type="number" placeholder="e.g., 30" value={formData.acresCapacityPerDay} onChange={(e) => updateField('acresCapacityPerDay', Number(e.target.value))} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="pricePerAcre">Price Per Unit (₹)</Label>
                    <Input id="pricePerAcre" type="number" placeholder="e.g., 500" value={formData.pricePerAcre} onChange={(e) => updateField('pricePerAcre', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="unit">Price Unit</Label>
                    <Select value={formData.unit} onValueChange={(value) => updateField('unit', value)}>
                        <SelectTrigger id="unit"><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Per Acre">Per Acre</SelectItem>
                        <SelectItem value="Per Hour">Per Hour</SelectItem>
                        <SelectItem value="Per Day">Per Day</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableDays">Preferred Days (Can be changed later)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 border rounded-md">
                {daysOfWeek.map(day => (
                  <div key={day} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={`day-${day}`} 
                      value={day} 
                      checked={formData.availableDays.includes(day)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        updateField('availableDays', 
                          checked 
                            ? [...formData.availableDays, day] 
                            : formData.availableDays.filter(d => d !== day)
                        );
                      }}
                      className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <Label htmlFor={`day-${day}`}>{day}</Label>
                  </div>
                ))}
              </div>
              <CardDescription>Select multiple days by checking boxes.</CardDescription>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredTime">Preferred Time of Day</Label>
              <Select value={formData.preferredTime} onValueChange={(value) => updateField('preferredTime', value)}>
                <SelectTrigger id="preferredTime"><SelectValue placeholder="Select preferred time" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any_time">Any Time</SelectItem>
                  <SelectItem value="Morning">Morning (e.g., 7 AM - 10 AM)</SelectItem>
                  <SelectItem value="Evening">Evening (e.g., 4 PM - 7 PM)</SelectItem>
                  <SelectItem value="Both">Both Morning & Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="travelMode">Primary Travel Mode to Farm</Label>
              <Select value={formData.travelMode} onValueChange={(value) => updateField('travelMode', value)}>
                <SelectTrigger id="travelMode"><SelectValue placeholder="Select travel mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Own Vehicle">Own Vehicle (Bike/Car)</SelectItem>
                  <SelectItem value="Public Transport">Public Transport</SelectItem>
                  <SelectItem value="Walk">Walk (if very close)</SelectItem>
                   <SelectItem value="Provided by Farmer">Provided by Farmer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="servicesExpected">Support Expected from Tatya Mitra</Label>
              <Select value={formData.servicesExpected} onValueChange={(value) => updateField('servicesExpected', value)}>
                <SelectTrigger id="servicesExpected"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Marketing Support">Marketing Support</SelectItem>
                  <SelectItem value="Order Booking">Order Booking Assistance</SelectItem>
                  <SelectItem value="On-field Training">On-field Pilot Training</SelectItem>
                  <SelectItem value="All of the above">All of the above</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceableRadius">Serviceable Radius (in KM)</Label>
              <Input id="serviceableRadius" type="number" placeholder="e.g., 25" value={formData.serviceableRadius} onChange={(e) => updateField('serviceableRadius', Number(e.target.value))} />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between mt-6">
        {step > 1 && <Button variant="outline" onClick={prevStep}>Back</Button>}
        <div className="ml-auto"> {/* This div ensures the Next/Submit button is pushed to the right */}
          {step < 3 ? (
            <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">Next</Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90">Submit Details</Button>
          )}
        </div>
      </CardFooter>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <PartyPopper className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold">Let's Get Started!</DialogTitle>
          </DialogHeader>
          <DialogDescription className="my-4 text-base">
            You're all set! Let’s earn lakhs by renting technology and empowering farmers' lives. 🚀
          </DialogDescription>
          <Button onClick={() => {
              setShowSuccess(false);
              // Potentially redirect or reset form:
              // router.push('/dashboard');
              // setFormData(initialFormData); setStep(1);
            }}
            className="w-full bg-primary hover:bg-primary/90"
          >
            View Dashboard (Example)
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

