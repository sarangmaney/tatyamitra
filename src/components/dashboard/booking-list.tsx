
"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";

export interface Booking {
  id: string;
  equipmentName: string;
  farmerName: string;
  bookingDate: string; // ISO string or formatted date
  duration: string; // e.g., "2 hours", "1 day"
  totalAmount: number;
  paymentStatus: "paid" | "pending" | "failed";
  bookingStatus: "confirmed" | "pending" | "cancelled" | "completed";
  farmerLocation?: { lat: number; lng: number; address: string }; // Optional
}

const initialBookings: Booking[] = [
  {
    id: "B001",
    equipmentName: "Mahindra JIVO 245 DI",
    farmerName: "Ramesh Kumar",
    bookingDate: new Date(Date.now() - 86400000 * 2).toLocaleDateString(), // 2 days ago
    duration: "4 hours",
    totalAmount: 2400,
    paymentStatus: "paid",
    bookingStatus: "completed",
    farmerLocation: { lat: 28.6139, lng: 77.2090, address: "Village Rampur, UP" },
  },
  {
    id: "B002",
    equipmentName: "Crop Spraying Drone",
    farmerName: "Sunita Devi",
    bookingDate: new Date().toLocaleDateString(), // Today
    duration: "Full Day (8 acres)",
    totalAmount: 9600,
    paymentStatus: "pending",
    bookingStatus: "confirmed",
    farmerLocation: { lat: 28.6139, lng: 77.2090, address: "Khetpur, Bihar" },
  },
  {
    id: "B003",
    equipmentName: "Rotavator Attachment",
    farmerName: "Amit Singh",
    bookingDate: new Date(Date.now() + 86400000).toLocaleDateString(), // Tomorrow
    duration: "3 hours",
    totalAmount: 900,
    paymentStatus: "paid",
    bookingStatus: "pending",
  },
  {
    id: "B004",
    equipmentName: "Mahindra JIVO 245 DI",
    farmerName: "Priya Sharma",
    bookingDate: new Date(Date.now() - 86400000 * 5).toLocaleDateString(), // 5 days ago
    duration: "2 hours",
    totalAmount: 1200,
    paymentStatus: "failed",
    bookingStatus: "cancelled",
  },
];

const bookingStatusConfig = {
  confirmed: { variant: "default", icon: CheckCircle, label: "Confirmed", color: "bg-green-500" },
  pending: { variant: "secondary", icon: Clock, label: "Pending", color: "bg-yellow-500" },
  cancelled: { variant: "destructive", icon: XCircle, label: "Cancelled", color: "bg-red-500" },
  completed: { variant: "outline", icon: CheckCircle, label: "Completed", color: "bg-blue-500" },
} as const;

const paymentStatusConfig = {
  paid: { variant: "default", label: "Paid", color: "bg-green-500" },
  pending: { variant: "secondary", label: "Pending", color: "bg-yellow-500" },
  failed: { variant: "destructive", label: "Failed", color: "bg-red-500" },
} as const;


export function BookingList() {
  const [bookings, setBookings] = React.useState<Booking[]>(initialBookings);

  // In a real app, these actions would call an API
  const handleViewDetails = (bookingId: string) => alert(`View details for booking ${bookingId}`);
  const handleConfirmBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? {...b, bookingStatus: 'confirmed'} : b));
  };
  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? {...b, bookingStatus: 'cancelled'} : b));
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
          <CardDescription>Manage incoming and ongoing bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const SIcon = bookingStatusConfig[booking.bookingStatus].icon;
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>{booking.equipmentName}</TableCell>
                    <TableCell>{booking.farmerName}</TableCell>
                    <TableCell>{booking.bookingDate}</TableCell>
                    <TableCell>₹{booking.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusConfig[booking.paymentStatus].variant} className={`${paymentStatusConfig[booking.paymentStatus].color} text-white`}>
                        {paymentStatusConfig[booking.paymentStatus].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={bookingStatusConfig[booking.bookingStatus].variant} className={`${bookingStatusConfig[booking.bookingStatus].color} text-white flex items-center gap-1`}>
                        <SIcon className="h-3.5 w-3.5" />
                        {bookingStatusConfig[booking.bookingStatus].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(booking.id)} title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {booking.bookingStatus === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleConfirmBooking(booking.id)} className="text-green-600 hover:text-green-700" title="Confirm">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleCancelBooking(booking.id)} className="text-red-600 hover:text-red-700" title="Cancel">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
           {bookings.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No bookings found.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Farmer Location (Example)</CardTitle>
          <CardDescription>Map showing a sample farmer&apos;s location for a booking.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.find(b => b.farmerLocation)?.farmerLocation ? (
            <>
              <p className="mb-2 text-sm">Location for booking <span className="font-semibold">{bookings.find(b => b.farmerLocation)?.id}</span>: {bookings.find(b => b.farmerLocation)?.farmerLocation?.address}</p>
              <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
                <Image
                  src="https://placehold.co/800x450.png"
                  alt="Farmer Location Map"
                  width={800}
                  height={450}
                  className="object-cover w-full h-full"
                  data-ai-hint="map location"
                />
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">No booking with location data to display.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    