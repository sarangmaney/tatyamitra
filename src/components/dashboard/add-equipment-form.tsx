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
import type { Equipment } from "./equipment-card";

const equipmentFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters.").max(100),
  type: z.string().min(3, "Type must be at least 3 characters.").max(50),
  specifications: z.string().min(10, "Specifications must be at least 10 characters.").max(500),
  status: z.enum(["available", "unavailable", "maintenance"]),
  price: z.string().optional().describe("e.g. ₹500/hr or ₹2000/acre"),
  imageUrl: z.string().url("Please enter a valid image URL.").optional(),
  // In a real app, this would be a file upload field.
  // For now, we'll use a text input for image URL.
  // photoVideo: z.instanceof(File).optional(), 
});

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

interface AddEquipmentFormProps {
  onSubmit: (data: EquipmentFormValues) => void;
  defaultValues?: Partial<Equipment>;
  isLoading?: boolean;
}

export function AddEquipmentForm({ onSubmit, defaultValues, isLoading }: AddEquipmentFormProps) {
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || "",
      specifications: defaultValues?.specifications || "",
      status: defaultValues?.status || "available",
      price: defaultValues?.price || "",
      imageUrl: defaultValues?.imageUrl || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Deere Tractor 5050D" {...field} />
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
              <FormLabel>Equipment Type/Service</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Tractor, Harvester, Ploughing Service" {...field} />
              </FormControl>
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
                  placeholder="Describe the equipment or service, its features, capacity, etc."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <FormDescription>Enter price per hour, per acre, etc.</FormDescription>
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
                For demonstration, use a URL. In a real app, this would be a file upload.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* 
        <FormField
          control={form.control}
          name="photoVideo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo/Video Upload</FormLabel>
              <FormControl>
                 <Input type="file" accept="image/*,video/*" onChange={(e) => field.onChange(e.target.files?.[0])} />
              </FormControl>
              <FormDescription>Upload relevant photos or videos of the equipment/service.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
          {isLoading ? "Saving..." : (defaultValues?.id ? "Update Equipment" : "Add Equipment")}
        </Button>
      </form>
    </Form>
  );
}
