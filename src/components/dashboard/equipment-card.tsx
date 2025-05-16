
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Trash2, Eye, Star, Phone, TrendingUp, Video } from "lucide-react"; 
import Link from "next/link";

export interface Equipment {
  id: string;
  name: string;
  type: string; 
  specifications: string;
  status: "available" | "unavailable" | "maintenance";
  imageUrl?: string;
  price?: string; 
  category?: string; 
  rating?: number; 
  reviewCount?: number;
  vendorPhoneNumber?: string; 
  videoUrl?: string;
  yieldIncreaseBenefit?: string; // New field
  dataAiHint?: string; // Optional hint for image generation
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
    ? `https://wa.me/${equipment.vendorPhoneNumber.replace(/\D/g, '')}` 
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
          data-ai-hint={equipment.dataAiHint || "tractor farm equipment"}
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
              className="absolute bottom-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={(e) => { e.stopPropagation(); window.open(equipment.videoUrl, '_blank');}}
              title="Watch Video Demo"
            >
              <Video className="h-4 w-4" /> 
            </Button>
          )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-1">{equipment.name}</CardTitle>
        {equipment.category && (
          <p className="text-xs text-muted-foreground mb-1">{equipment.category}</p>
        )}
        <CardDescription className="text-sm text-muted-foreground mb-1">{equipment.type}</CardDescription>
        
        {equipment.rating !== undefined && equipment.rating > 0 && (
          <div className="flex items-center gap-1 my-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span>{equipment.rating.toFixed(1)}</span>
            {equipment.reviewCount !== undefined && (
              <span className="text-xs">({equipment.reviewCount} reviews)</span>
            )}
          </div>
        )}

        <p className="text-sm mb-2 line-clamp-3 h-[3.75rem]">{equipment.specifications}</p> 
        
        {equipment.yieldIncreaseBenefit && (
          <div className="mt-2 p-2 bg-primary/10 rounded-md">
            <div className="flex items-center text-xs text-primary font-semibold mb-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              Yield Benefit
            </div>
            <p className="text-xs text-primary/80 line-clamp-2">{equipment.yieldIncreaseBenefit}</p>
          </div>
        )}
        
      </CardContent>
      <CardFooter className="p-4 border-t flex flex-col items-start space-y-3">
        {equipment.price && <p className="text-lg font-semibold text-primary w-full">{equipment.price}</p>}
        <div className="flex justify-between items-center w-full">
          <div>
            {whatsappLink && (
              <Button variant="ghost" size="icon" asChild title="Contact on WhatsApp">
                <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Phone className="h-5 w-5 text-green-500" /> 
                </Link>
              </Button>
            )}
          </div>
          <div className="flex space-x-1">
            {onViewDetails && (
              <Button variant="ghost" size="icon" onClick={() => onViewDetails(equipment.id)} title="View Details">
                <Eye className="h-5 w-5" />
              </Button>
            )}
            {/* Conditionally render Edit/Delete if onEdit/onDelete are provided, useful for portfolio view */}
            {typeof onEdit === 'function' && typeof onDelete === 'function' && (
              <>
                <Button variant="outline" size="icon" onClick={() => onEdit(equipment.id)} title="Edit">
                  <Edit3 className="h-5 w-5" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => onDelete(equipment.id)} title="Delete">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

    