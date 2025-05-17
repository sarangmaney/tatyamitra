
import { BookingList } from "@/components/dashboard/booking-list";

export default function BookingsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Booking Management</h1>
        <p className="text-muted-foreground">Oversee all your bookings, track payments, and manage schedules.</p>
      </div>
      <BookingList />
    </div>
  );
}

    