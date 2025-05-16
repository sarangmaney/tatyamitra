"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Tractor as TractorIcon } from "lucide-react"; // Renamed Tractor to TractorIcon to avoid conflict
import { EquipmentCard, type Equipment } from "@/components/dashboard/equipment-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddEquipmentForm } from "@/components/dashboard/add-equipment-form";
import { useToast } from "@/hooks/use-toast";

const initialEquipments: Equipment[] = [
  {
    id: "1",
    name: "Mahindra JIVO 245 DI",
    type: "Tractor",
    category: "Mini Tractor",
    specifications: "24 HP, 4WD, Power Steering, Ideal for small farms and orchards. Includes basic plough attachment.",
    status: "available",
    imageUrl: "https://placehold.co/600x400.png",
    price: "₹600/hour",
    rating: 4.5,
    reviewCount: 12,
    vendorPhoneNumber: "+911234567890", // Example phone number
    videoUrl: "https://www.youtube.com/watch?v=examplevideo1"
  },
  {
    id: "2",
    name: "Crop Spraying Drone",
    type: "Drone Service",
    category: "Agricultural Drone",
    specifications: "10L capacity, 5 acres/hour coverage, Precision spraying with AI-powered nozzle control.",
    status: "maintenance",
    imageUrl: "https://placehold.co/600x400.png",
    price: "₹1200/acre",
    rating: 4.8,
    reviewCount: 8,
    vendorPhoneNumber: "+911234567891",
  },
  {
    id: "3",
    name: "Rotavator Attachment",
    type: "Implement",
    category: "Tillage Equipment",
    specifications: "6 feet width, suitable for 45-55 HP tractors, for primary and secondary tillage.",
    status: "unavailable",
    imageUrl: "https://placehold.co/600x400.png",
    price: "₹300/hour",
    rating: 4.2,
    reviewCount: 5,
    vendorPhoneNumber: "+911234567892",
    videoUrl: "https://www.youtube.com/watch?v=examplevideo2"
  },
];

export default function EquipmentPage() {
  const [equipments, setEquipments] = React.useState<Equipment[]>(initialEquipments);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingEquipment, setEditingEquipment] = React.useState<Equipment | undefined>(undefined);
  const { toast } = useToast();

  const handleAddEquipment = (data: any) => { // Type 'any' for form data for now
    const equipmentData = {
      ...data,
      // Ensure placeholder values if not provided, matching Equipment type
      imageUrl: data.imageUrl || "https://placehold.co/600x400.png",
      category: data.category || "General Equipment",
      rating: data.rating || undefined,
      reviewCount: data.reviewCount || undefined,
      vendorPhoneNumber: data.vendorPhoneNumber || undefined,
    };

    if (editingEquipment) {
      setEquipments(equipments.map(eq => eq.id === editingEquipment.id ? { ...eq, ...equipmentData, id: editingEquipment.id } : eq));
      toast({ title: "Equipment Updated", description: `${equipmentData.name} has been updated successfully.` });
    } else {
      const newEquipment: Equipment = { ...equipmentData, id: String(Date.now()) }; // Simple ID generation
      setEquipments([newEquipment, ...equipments]);
      toast({ title: "Equipment Added", description: `${equipmentData.name} has been added successfully.` });
    }
    setIsDialogOpen(false);
    setEditingEquipment(undefined);
  };

  const handleEdit = (id: string) => {
    const equipmentToEdit = equipments.find(eq => eq.id === id);
    if (equipmentToEdit) {
      setEditingEquipment(equipmentToEdit);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    // Add confirmation dialog in real app
    setEquipments(equipments.filter(eq => eq.id !== id));
    toast({ title: "Equipment Deleted", description: "The equipment has been removed.", variant: "destructive" });
  };
  
  const openAddDialog = () => {
    setEditingEquipment(undefined);
    setIsDialogOpen(true);
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8" id="add-new">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Equipment</h1>
          <p className="text-muted-foreground">Manage your agricultural equipment and services.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingEquipment(undefined); }}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{editingEquipment ? "Edit Equipment" : "Add New Equipment"}</DialogTitle>
              <DialogDescription>
                {editingEquipment ? "Update the details of your equipment." : "Fill in the details to list new equipment or service."}
              </DialogDescription>
            </DialogHeader>
            <AddEquipmentForm 
              onSubmit={handleAddEquipment} 
              defaultValues={editingEquipment}
            />
          </DialogContent>
        </Dialog>
      </div>

      {equipments.length === 0 ? (
        <div className="text-center py-10">
          <TractorIcon className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Equipment Listed Yet</h2>
          <p className="text-muted-foreground mb-4">Start by adding your first piece of equipment or service.</p>
          <Button onClick={openAddDialog} className="bg-accent hover:bg-accent/90">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Equipment
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {equipments.map((equipment) => (
            <EquipmentCard 
              key={equipment.id} 
              equipment={{
                ...equipment,
                imageUrl: equipment.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(equipment.name.substring(0,15))}`
              }} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
// Ensure all images in EquipmentCard have data-ai-hint
// In initialEquipments, the EquipmentCard component itself adds data-ai-hint="tractor farm equipment"
// to its Image component. If specific hints are needed per item:
// Modify EquipmentCard to accept data-ai-hint or modify the map function here.
// For now, the generic hint in EquipmentCard will cover these.
// Example of specific data-ai-hint (if logic was in this file for image creation):
// imageUrl: `https://placehold.co/600x400.png`, dataAiHint: equipment.type.toLowerCase().includes("drone") ? "drone agriculture" : "farm equipment"
