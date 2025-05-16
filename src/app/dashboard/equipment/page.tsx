"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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
    specifications: "24 HP, 4WD, Power Steering, Ideal for small farms and orchards.",
    status: "available",
    imageUrl: "https://placehold.co/600x400.png?text=Tractor+1",
    price: "₹600/hour",
  },
  {
    id: "2",
    name: "Crop Spraying Drone",
    type: "Drone Service",
    specifications: "10L capacity, 5 acres/hour coverage, Precision spraying.",
    status: "maintenance",
    imageUrl: "https://placehold.co/600x400.png?text=Drone+Service",
    price: "₹1200/acre",
  },
  {
    id: "3",
    name: "Rotavator Attachment",
    type: "Implement",
    specifications: "6 feet width, suitable for 45-55 HP tractors, Tillage.",
    status: "unavailable",
    imageUrl: "https://placehold.co/600x400.png?text=Rotavator",
    price: "₹300/hour",
  },
];

export default function EquipmentPage() {
  const [equipments, setEquipments] = React.useState<Equipment[]>(initialEquipments);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingEquipment, setEditingEquipment] = React.useState<Equipment | undefined>(undefined);
  const { toast } = useToast();

  const handleAddEquipment = (data: any) => { // Type 'any' for form data for now
    if (editingEquipment) {
      setEquipments(equipments.map(eq => eq.id === editingEquipment.id ? { ...eq, ...data, id: editingEquipment.id } : eq));
      toast({ title: "Equipment Updated", description: `${data.name} has been updated successfully.` });
    } else {
      const newEquipment: Equipment = { ...data, id: String(Date.now()) }; // Simple ID generation
      setEquipments([newEquipment, ...equipments]);
      toast({ title: "Equipment Added", description: `${data.name} has been added successfully.` });
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
          <Tractor className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
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
              equipment={equipment} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
