
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PlusCircle, Loader2 } from "lucide-react";

const addVendorFormSchema = z.object({
  ownerName: z.string().min(2, "Owner name must be at least 2 characters."),
  vendorName: z.string().min(2, "Vendor/Center name must be at least 2 characters."),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
  district: z.string().min(2, "District is required."),
  taluka: z.string().min(2, "Taluka is required."),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits."),
  profileImageUri: z.string().url("Please enter a valid URL for profile image.").optional().or(z.literal('')), // Allow empty string
  employeeName: z.string().min(2, "Employee name is required."),
});

type AddVendorFormValues = z.infer<typeof addVendorFormSchema>;

interface AddVendorDialogProps {
  onVendorAdded: () => void;
}

export function AddVendorDialog({ onVendorAdded }: AddVendorDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<AddVendorFormValues>({
    resolver: zodResolver(addVendorFormSchema),
    defaultValues: {
      ownerName: "",
      vendorName: "",
      phoneNumber: "",
      district: "",
      taluka: "",
      pincode: "",
      profileImageUri: "",
      employeeName: "",
    },
  });

  async function onSubmit(data: AddVendorFormValues) {
    setIsSubmitting(true);
    try {
      const vendorData = {
        ...data,
        profileImageUri: data.profileImageUri || `https://placehold.co/100x100.png?text=${data.vendorName?.substring(0,2) || 'V'}`, // Default placeholder
        createdAt: serverTimestamp(),
        // Add any other default fields for a new vendor
        kyc: 'Pending', 
        // Example: lastLogin could be set on actual login, not vendor creation by admin
      };
      await addDoc(collection(db, "vendor"), vendorData);
      
      toast({
        title: "Vendor Added Successfully!",
        description: `${data.vendorName} has been added to the system.`,
      });
      form.reset(); // Reset form after successful submission
      onVendorAdded(); // Callback to refresh parent list
      setIsOpen(false); // Close dialog
    } catch (error) {
      console.error("Error adding vendor: ", error);
      toast({
        variant: "destructive",
        title: "Failed to Add Vendor",
        description: "An error occurred while saving the vendor. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Vendor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
          <DialogDescription>
            Fill in the details below to register a new vendor. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="vendorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor/Center Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Patil Krishi Seva Kendra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Suresh Patil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <div className="flex items-center">
                    <span className="flex h-10 items-center justify-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                      +91
                    </span>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter 10-digit number"
                        maxLength={10}
                        className="rounded-l-none"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Pune" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="taluka"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Taluka</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Haveli" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode</FormLabel>
                  <FormControl>
                    <Input type="tel" maxLength={6} placeholder="e.g., 411001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profileImageUri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/image.png" {...field} />
                  </FormControl>
                  <FormDescription>Paste a URL to an image for the vendor's profile.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Added by Employee</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormDescription>Name of the employee registering this vendor.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                 <Button type="button" variant="outline" onClick={() => form.reset()}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Vendor
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
