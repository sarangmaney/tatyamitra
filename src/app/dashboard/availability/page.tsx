import { AvailabilityCalendar } from "@/components/dashboard/availability-calendar";

export default function AvailabilityPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Availability Management</h1>
        <p className="text-muted-foreground">Control when your equipment or services are available for booking.</p>
      </div>
      <AvailabilityCalendar />
    </div>
  );
}
