import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tractor, CalendarDays, ClipboardList, DollarSign, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const summaryCards = [
    { title: "My Equipment", description: "Manage your listed equipment and services.", icon: Tractor, link: "/dashboard/equipment", cta: "View Equipment" },
    { title: "Availability", description: "Set your working hours and block dates.", icon: CalendarDays, link: "/dashboard/availability", cta: "Manage Availability" },
    { title: "Bookings", description: "View and manage incoming bookings.", icon: ClipboardList, link: "/dashboard/bookings", cta: "View Bookings" },
    { title: "Earnings", description: "Track your payments and earnings.", icon: DollarSign, link: "/dashboard/bookings", cta: "Track Earnings" }, // Link to bookings for now
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to Harit Mitra!</h1>
        <p className="text-muted-foreground">Here&apos;s an overview of your activities.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">{card.title}</CardTitle>
              <card.icon className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
              <Button asChild variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <Link href={card.link}>
                  {card.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/dashboard/equipment#add-new">Add New Equipment</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/dashboard/pricing-tool">Get Price Suggestion</Link>
            </Button>
             <Button asChild variant="secondary" size="lg">
              <Link href="/dashboard/settings">Update Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
