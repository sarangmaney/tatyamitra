
"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export interface Review {
  id: string;
  reviewerName: string;
  reviewerImageUrl?: string;
  rating: number; // 0-5
  comment: string;
  date: string; // Formatted date string
}

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const getAvatarFallback = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return initials.substring(0, 2);
  }

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12 border">
            <AvatarImage src={review.reviewerImageUrl || "https://placehold.co/50x50.png"} alt={review.reviewerName} data-ai-hint="person avatar" />
            <AvatarFallback>{getAvatarFallback(review.reviewerName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{review.reviewerName}</h3>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{review.date}</p>
            <p className="mt-2 text-foreground leading-relaxed">{review.comment}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

    