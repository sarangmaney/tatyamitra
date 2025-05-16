"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Equipment } from "./equipment-card"; // Using the enhanced Equipment type

const equipmentFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters.").max(100),
  type: z.string().min(3, "Type must be at least 3 characters.").max(50).describe("Broad type like Tractor, Drone, Implement, Service"),
  category: z.string().min(3, "Category must be at least 3 characters.").max(50).optional().describe("More specific category, e.g., Mini Tractor, Spraying Drone"),
  specifications: z.string().min(10, "Specifications must be at least 10 characters.").max(500),
  status: z.enum(["available", "unavailable", "maintenance"]),
  price: z.string().optional().describe("e.g. ₹500/hr or ₹2000/acre"),
  imageUrl: z.string().url("Please enter a valid image URL.").optional(),
  vendorPhoneNumber: z.string().optional().describe("Vendor's WhatsApp contact number, e.g., +91XXXXXXXXXX"),
  videoUrl: z.string().url("Please enter a valid video URL (e.g., YouTube link).").optional().describe("URL for equipment video demo"),
  // Rating and reviewCount are usually not set via form directly but through user interactions
});

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

interface AddEquipmentFormProps {
  onSubmit: (data: EquipmentFormValues) => void;
  defaultValues?: Partial<Equipment>; // Using Equipment type from equipment-card which includes new fields
  isLoading?: boolean;
}

export function AddEquipmentForm({ onSubmit, defaultValues, isLoading }: AddEquipmentFormProps) {
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || "",
      category: defaultValues?.category || "",
      specifications: defaultValues?.specifications || "",
      status: defaultValues?.status || "available",
      price: defaultValues?.price || "",
      imageUrl: defaultValues?.imageUrl || "",
      vendorPhoneNumber: defaultValues?.vendorPhoneNumber || "",
      videoUrl: defaultValues?.videoUrl || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipment Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., John Deere 5050D" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipment Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Tractor, Drone Service" {...field} />
                </FormControl>
                 <FormDescription>Broad classification.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Mini Tractor, FPV Drone" {...field} />
                </FormControl>
                <FormDescription>Specific category for better filtering.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="specifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Specifications</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe features, capacity, HP, attachments etc."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., ₹500/hour or ₹2000/acre" {...field} />
                </FormControl>
                <FormDescription>Enter price per unit (hour, acre, day).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormDescription>
                Link to an image of the equipment. Use placeholder e.g. https://placehold.co/600x400.png
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Demo URL (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://youtube.com/watch?v=demo" {...field} />
              </FormControl>
              <FormDescription>Link to a video demonstration.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="vendorPhoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Contact Number (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+911234567890" {...field} />
              </FormControl>
              <FormDescription>Your contact number for WhatsApp inquiries (include country code).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
       
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
          {isLoading ? "Saving..." : (defaultValues?.id ? "Update Equipment" : "Add Equipment")}
        </Button>
      </form>
    </Form>
  );
}
