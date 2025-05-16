import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Trash2, Eye, Star, MessageCircle, Phone } from "lucide-react"; // Added Star, MessageCircle (for WhatsApp)
import Link from "next/link"; // Added Link for WhatsApp

export interface Equipment {
  id: string;
  name: string;
  type: string; // Could also be category
  specifications: string;
  status: "available" | "unavailable" | "maintenance";
  imageUrl?: string;
  price?: string; // e.g., "₹500/hour" or "₹2000/acre"
  category?: string; // More specific category
  rating?: number; // Average rating 0-5
  reviewCount?: number;
  vendorPhoneNumber?: string; // For WhatsApp link
  videoUrl?: string; // For video demos
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

  const whatsappLink = equipment.vendorPhoneNumber 
    ? `https://wa.me/${equipment.vendorPhoneNumber.replace(/\D/g, '')}` // Basic formatting for IN numbers
    : undefined;

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
          {equipment.videoUrl && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => window.open(equipment.videoUrl, '_blank')} // Simple link open, could be a modal
              title="Watch Video Demo"
            >
              {/* Replace with Play icon if desired */}
              <Eye className="h-4 w-4" /> 
            </Button>
          )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-1">{equipment.name}</CardTitle>
        {equipment.category && (
          <p className="text-xs text-muted-foreground mb-1">{equipment.category}</p>
        )}
        <CardDescription className="text-sm text-muted-foreground mb-1">{equipment.type}</CardDescription>
        
        {equipment.rating !== undefined && equipment.rating > 0 && (
          <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span>{equipment.rating.toFixed(1)}</span>
            {equipment.reviewCount !== undefined && (
              <span className="text-xs">({equipment.reviewCount} reviews)</span>
            )}
          </div>
        )}

        <p className="text-sm mb-2 line-clamp-2 h-10">{equipment.specifications}</p> {/* Fixed height for consistency */}
        {equipment.price && <p className="text-lg font-semibold text-primary">{equipment.price}</p>}
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between items-center">
        <div>
          {whatsappLink && (
            <Button variant="ghost" size="icon" asChild title="Contact on WhatsApp">
              <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                {/* Using Phone icon as a stand-in, could use a WhatsApp specific SVG */}
                <Phone className="h-5 w-5 text-green-500" /> 
              </Link>
            </Button>
          )}
        </div>
        <div className="flex space-x-2">
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
        </div>
      </CardFooter>
    </Card>
  );
}
