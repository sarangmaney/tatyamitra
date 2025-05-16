import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Trash2, Eye } from "lucide-react";

export interface Equipment {
  id: string;
  name: string;
  type: string;
  specifications: string;
  status: "available" | "unavailable" | "maintenance";
  imageUrl?: string;
  price?: string; // e.g., "₹500/hour" or "₹2000/acre"
}

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function EquipmentCard({ equipment, onEdit, onDelete, onViewDetails }: EquipmentCardProps) {
  const statusBadgeVariant = {
    available: "default",
    unavailable: "destructive",
    maintenance: "secondary",
  } as const;
  
  const statusText = {
    available: "Available",
    unavailable: "Unavailable",
    maintenance: "Maintenance",
  }

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0 relative">
        <Image
          src={equipment.imageUrl || "https://placehold.co/600x400.png"}
          alt={equipment.name}
          width={600}
          height={400}
          className="object-cover w-full h-48"
          data-ai-hint="tractor farm equipment"
        />
         <Badge 
            variant={statusBadgeVariant[equipment.status]} 
            className="absolute top-2 right-2 capitalize"
          >
            {statusText[equipment.status]}
          </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-1">{equipment.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-1">{equipment.type}</CardDescription>
        <p className="text-sm mb-2 line-clamp-2">{equipment.specifications}</p>
        {equipment.price && <p className="text-lg font-semibold text-primary">{equipment.price}</p>}
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-end space-x-2">
        {onViewDetails && (
          <Button variant="ghost" size="icon" onClick={() => onViewDetails(equipment.id)} title="View Details">
            <Eye className="h-5 w-5" />
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={() => onEdit(equipment.id)} title="Edit">
          <Edit3 className="h-5 w-5" />
        </Button>
        <Button variant="destructive" size="icon" onClick={() => onDelete(equipment.id)} title="Delete">
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
