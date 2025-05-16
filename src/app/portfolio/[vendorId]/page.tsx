
"use client";

import * as React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EquipmentCard, type Equipment } from "@/components/dashboard/equipment-card";
import { ReviewCard, type Review } from "@/components/portfolio/review-card";
import { Share2, Copy, MessageCircle, Star, Briefcase, Users, Award, Tractor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Enhanced Equipment type for portfolio context, including yieldIncreaseBenefit
interface PortfolioEquipment extends Equipment {
  yieldIncreaseBenefit?: string;
}

interface VendorPortfolioData {
  id: string;
  name: string;
  bio: string;
  profileImageUrl: string;
  location: string;
  contactEmail: string;
  equipments: PortfolioEquipment[];
  experience: {
    summary: string;
    stats: Array<{
      id: string;
      label: string;
      value: string;
      icon: React.ElementType;
    }>;
  };
  reviews: Review[];
}

// Mock data - replace with actual data fetching
const mockVendorData: VendorPortfolioData = {
  id: "vendor_12345xyz",
  name: "GreenSprout AgriSolutions",
  bio: "Your trusted partner for modern agricultural equipment and solutions. We empower farmers with top-quality machinery and expert advice to boost productivity and sustainability.",
  profileImageUrl: "https://placehold.co/150x150.png",
  location: "Satara, Maharashtra",
  contactEmail: "contact@greensproutagri.com",
  equipments: [
    {
      id: "eq1",
      name: "Advanced Power Tiller",
      type: "Tiller",
      category: "Soil Preparation",
      specifications: "15 HP, Diesel Engine, Multi-speed gearbox, adjustable depth control. Comes with rotavator and plough attachments.",
      status: "available",
      imageUrl: "https://placehold.co/600x400.png",
      dataAiHint: "tiller agriculture",
      price: "₹800/hour",
      rating: 4.7,
      reviewCount: 25,
      vendorPhoneNumber: "+919876543210",
      yieldIncreaseBenefit: "Ensures optimal soil pulverization, leading to better seed germination and root penetration, potentially increasing crop yield by 10-15%.",
      videoUrl: "https://www.youtube.com/watch?v=examplevideo1"
    },
    {
      id: "eq2",
      name: "Precision Seeding Drone",
      type: "Drone Service",
      category: "Planting & Seeding",
      specifications: "5kg seed capacity, AI-powered targeted seeding, covers 10 acres/hour. Reduces seed wastage.",
      status: "available",
      imageUrl: "https://placehold.co/600x400.png",
      dataAiHint: "drone seeding",
      price: "₹1500/acre",
      rating: 4.9,
      reviewCount: 18,
      vendorPhoneNumber: "+919876543210",
      yieldIncreaseBenefit: "Uniform seed distribution and optimal planting depth can improve germination rates by up to 20% and ensure healthier plant stands, contributing to higher overall yields.",
      videoUrl: "https://www.youtube.com/watch?v=examplevideo2"
    },
    {
      id: "eq3",
      name: "Automated Irrigation Sprinkler",
      type: "Irrigation System",
      category: "Water Management",
      specifications: "Covers 1 acre per unit, programmable schedule, water-efficient nozzles.",
      status: "maintenance",
      imageUrl: "https://placehold.co/600x400.png",
      dataAiHint: "irrigation sprinkler",
      price: "₹500/day/unit",
      rating: 4.5,
      reviewCount: 10,
      vendorPhoneNumber: "+919876543210",
      yieldIncreaseBenefit: "Provides consistent and optimal water supply, reducing water stress on crops. Can improve yield by 5-10% compared to manual or flood irrigation, especially in water-scarce areas.",
    },
     {
      id: "eq4",
      name: "Heavy Duty Cultivator",
      type: "Implement",
      category: "Tillage Equipment",
      specifications: "9-tyne, suitable for 50-60 HP tractors, for deep soil preparation.",
      status: "available",
      imageUrl: "https://placehold.co/600x400.png",
      dataAiHint: "cultivator farm",
      price: "₹400/hour",
      rating: 4.6,
      reviewCount: 15,
      vendorPhoneNumber: "+919876543210",
      yieldIncreaseBenefit: "Breaks up hard soil pans, improves water infiltration and root development, leading to yield increases of 8-12%.",
    },
  ],
  experience: {
    summary: "With over a decade of experience in the agricultural sector, GreenSprout AgriSolutions has been at the forefront of introducing innovative farming technologies to local communities. We understand the challenges faced by farmers and are committed to providing reliable equipment and support that makes a real difference. Our team comprises agricultural experts and skilled technicians dedicated to ensuring your success.",
    stats: [
      { id: "s1", label: "Years in Business", value: "10+", icon: Briefcase },
      { id: "s2", label: "Farmers Served", value: "500+", icon: Users },
      { id: "s3", label: "Equipment Rented", value: "2000+", icon: Tractor },
      { id: "s4", label: "Positive Feedback Rate", value: "95%", icon: Award },
    ],
  },
  reviews: [
    { id: "r1", reviewerName: "Sunil Patil", rating: 5, comment: "Excellent equipment and very professional service. The power tiller helped me prepare my land much faster.", date: "2024-07-15", reviewerImageUrl: "https://placehold.co/50x50.png" },
    { id: "r2", reviewerName: "Anita Desai", rating: 4, comment: "The seeding drone was a game-changer for my farm. Good support from the team.", date: "2024-06-28", reviewerImageUrl: "https://placehold.co/50x50.png" },
    { id: "r3", reviewerName: "Rajesh Kumar", rating: 5, comment: "Highly recommend GreenSprout! Their machinery is well-maintained.", date: "2024-05-10" },
  ],
};


export default function VendorPortfolioPage() {
  const params = useParams();
  const vendorId = params.vendorId as string;
  const { toast } = useToast();

  // In a real app, fetch vendorData based on vendorId
  const vendorData = mockVendorData; // Using mock data for now

  if (!vendorData) {
    return <div className="container mx-auto py-10 text-center">Vendor not found.</div>;
  }

  const handleShare = async (platform: "copy" | "whatsapp") => {
    const url = window.location.href;
    const text = `Check out ${vendorData.name}'s agricultural services on Tatya Mitra: ${url}`;

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link Copied!", description: "Portfolio link copied to clipboard." });
      } catch (err) {
        toast({ title: "Failed to Copy", description: "Could not copy link.", variant: "destructive" });
      }
    } else if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };
  
  const getAvatarFallback = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return initials.substring(0, 2);
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card shadow-md">
        <div className="container mx-auto p-6 md:flex md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={vendorData.profileImageUrl} alt={vendorData.name} data-ai-hint="vendor profile" />
              <AvatarFallback>{getAvatarFallback(vendorData.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{vendorData.name}</h1>
              <p className="text-muted-foreground mt-1">{vendorData.location}</p>
              <p className="text-sm text-muted-foreground mt-1">{vendorData.contactEmail}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleShare("copy")}>
              <Copy className="mr-2 h-4 w-4" /> Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleShare("whatsapp")} className="bg-green-500 hover:bg-green-600 text-white">
              <MessageCircle className="mr-2 h-4 w-4" /> Share on WhatsApp
            </Button>
             <Button variant="outline" size="sm" title="Share">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-6 py-3">
           <p className="text-foreground text-center md:text-left">{vendorData.bio}</p>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 md:px-6">
        <Tabs defaultValue="equipment" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-6"> {/* Reduced to 2 tabs */}
            <TabsTrigger value="equipment">Our Equipment</TabsTrigger>
            <TabsTrigger value="experience">Our Experience</TabsTrigger>
          </TabsList>

          <TabsContent value="equipment">
            <Card>
              <CardHeader>
                <CardTitle>Available Equipment & Services</CardTitle>
                <CardDescription>Explore our range of high-quality agricultural machinery and services designed to enhance your farming efficiency.</CardDescription>
              </CardHeader>
              <CardContent>
                {vendorData.equipments.length > 0 ? (
                  <div className="flex overflow-x-auto space-x-4 pb-4 -mx-1 px-1"> {/* Horizontal scroll container */}
                    {vendorData.equipments.map((equipment) => (
                       <div key={equipment.id} className="flex-shrink-0 w-[300px] md:w-[330px] lg:w-[350px]"> {/* Card width control */}
                        <EquipmentCard
                          equipment={{
                            ...equipment,
                            dataAiHint: equipment.dataAiHint || (equipment.type.toLowerCase().includes("drone") ? "drone agriculture" : "farm equipment")
                          }}
                          onEdit={() => {}} 
                          onDelete={() => {}} 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No equipment listed currently.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <CardTitle>Our Journey & Expertise</CardTitle>
                 <CardDescription>Learn more about our commitment to agricultural excellence.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-foreground leading-relaxed">{vendorData.experience.summary}</p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {vendorData.experience.stats.map((stat) => (
                    <Card key={stat.id} className="text-center p-4 shadow-md hover:shadow-lg transition-shadow">
                      <stat.icon className="h-10 w-10 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reviews Section - Moved below tabs */}
        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>What Our Customers Say</CardTitle>
              <CardDescription>Honest feedback from farmers who have partnered with us.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {vendorData.reviews.length > 0 ? (
                vendorData.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              ) : (
                <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="bg-muted py-8 text-center mt-12">
        <div className="container mx-auto">
          <p className="text-muted-foreground">&copy; {new Date().getFullYear()} {vendorData.name}. Powered by Tatya Mitra.</p>
          <p className="text-sm text-muted-foreground">
            <a href={`mailto:${vendorData.contactEmail}`} className="hover:text-primary">Contact Us</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

    