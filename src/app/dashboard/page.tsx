
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Tractor, CalendarDays, ClipboardList, DollarSign, ArrowRight, TrendingUp, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const summaryCards = [
    { title: "My Equipment", description: "Manage your listed equipment and services.", icon: Tractor, link: "/dashboard/equipment", cta: "View Equipment" },
    { title: "Availability", description: "Set your working hours and block dates.", icon: CalendarDays, link: "/dashboard/availability", cta: "Manage Availability" },
    { title: "Bookings", description: "View and manage incoming bookings.", icon: ClipboardList, link: "/dashboard/bookings", cta: "View Bookings" },
    // { title: "Earnings", description: "Track your payments and earnings.", icon: DollarSign, link: "/dashboard/bookings", cta: "Track Earnings" }, // Covered by new Income Overview
  ];

  // Mock earnings data
  const currentTotalEarning = 250000; // 2.5 Lakhs
  const maxTotalEarning = 1000000; // 10 Lakhs
  const totalEarningProgress = (currentTotalEarning / maxTotalEarning) * 100;

  const currentMonthlyEarning = 30000; // 30k
  const maxMonthlyEarning = 100000; // 1 Lakh
  const monthlyEarningProgress = (currentMonthlyEarning / maxMonthlyEarning) * 100;

  return (
    <div className="container mx-auto py-8">
      {/* Welcome message is now part of AppHeader for dashboard pages */}
      {/* 
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to Tatya Mitra!</h1>
        <p className="text-muted-foreground">Here&apos;s an overview of your activities.</p>
      </div> 
      */}

      {/* Income Overview Card */}
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <BarChart3 className="mr-3 h-7 w-7 text-primary" />
            Income Overview
          </CardTitle>
          <CardDescription>Track your progress towards your income goals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Total Earning Section */}
            <div className="p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-1">Total Income</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Target: ₹{maxTotalEarning.toLocaleString('en-IN')}
              </p>
              <Progress value={totalEarningProgress} className="w-full h-3 mb-2" />
              <p className="text-xl font-bold text-primary">
                ₹{currentTotalEarning.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Monthly Earning Section */}
            <div className="p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-1">This Month&apos;s Income</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Target: ₹{maxMonthlyEarning.toLocaleString('en-IN')}
              </p>
              <Progress value={monthlyEarningProgress} className="w-full h-3 mb-2" />
              <p className="text-xl font-bold text-primary">
                ₹{currentMonthlyEarning.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
           <Button className="w-full md:w-auto mt-4 bg-accent hover:bg-accent/90">
            <TrendingUp className="mr-2 h-5 w-5" />
            Boost My Income
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> {/* Adjusted grid for 3 items */}
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
