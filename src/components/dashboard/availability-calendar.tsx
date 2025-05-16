"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";

const operatingDaysDefault = [
  { id: "sun", label: "Sunday", checked: false, startTime: "09:00", endTime: "17:00" },
  { id: "mon", label: "Monday", checked: true, startTime: "09:00", endTime: "17:00" },
  { id: "tue", label: "Tuesday", checked: true, startTime: "09:00", endTime: "17:00" },
  { id: "wed", label: "Wednesday", checked: true, startTime: "09:00", endTime: "17:00" },
  { id: "thu", label: "Thursday", checked: true, startTime: "09:00", endTime: "17:00" },
  { id: "fri", label: "Friday", checked: true, startTime: "09:00", endTime: "17:00" },
  { id: "sat", label: "Saturday", checked: false, startTime: "09:00", endTime: "17:00" },
];

export function AvailabilityCalendar() {
  const [blockedDates, setBlockedDates] = React.useState<Date[]>([]);
  const [operatingDays, setOperatingDays] = React.useState(operatingDaysDefault);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const { toast } = useToast();

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setBlockedDates((prev) => {
      const isBlocked = prev.some(d => d.getTime() === date.getTime());
      if (isBlocked) {
        return prev.filter(d => d.getTime() !== date.getTime());
      } else {
        return [...prev, date];
      }
    });
  };

  const handleOperatingDayChange = (dayId: string, field: string, value: string | boolean) => {
    setOperatingDays(prev => 
      prev.map(day => 
        day.id === dayId ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSaveChanges = () => {
    // In a real app, save blockedDates and operatingDays to backend
    console.log("Blocked Dates:", blockedDates);
    console.log("Operating Hours:", operatingDays);
    toast({
      title: "Availability Updated",
      description: "Your availability settings have been saved.",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2 shadow-lg">
        <CardHeader>
          <CardTitle>Manage Availability Calendar</CardTitle>
          <CardDescription>Select dates to mark them as unavailable. Click again to unblock.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="multiple"
            selected={blockedDates}
            onSelect={(dates) => setBlockedDates(dates || [])}
            modifiers={{ blocked: blockedDates }}
            modifiersStyles={{
              blocked: { backgroundColor: 'hsl(var(--destructive)/0.3)', color: 'hsl(var(--destructive-foreground))' },
            }}
            className="rounded-md border p-4"
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
          <CardDescription>Set your standard weekly operating hours.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {operatingDays.map((day) => (
            <div key={day.id} className="space-y-2 p-3 border rounded-md bg-muted/20">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={day.id} 
                  checked={day.checked} 
                  onCheckedChange={(checked) => handleOperatingDayChange(day.id, 'checked', !!checked)}
                />
                <Label htmlFor={day.id} className="font-medium text-base">{day.label}</Label>
              </div>
              {day.checked && (
                <div className="grid grid-cols-2 gap-2 pl-6">
                  <div>
                    <Label htmlFor={`${day.id}-start`} className="text-xs">Start Time</Label>
                    <Input 
                      id={`${day.id}-start`} 
                      type="time" 
                      value={day.startTime}
                      onChange={(e) => handleOperatingDayChange(day.id, 'startTime', e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${day.id}-end`} className="text-xs">End Time</Label>
                    <Input 
                      id={`${day.id}-end`} 
                      type="time" 
                      value={day.endTime}
                      onChange={(e) => handleOperatingDayChange(day.id, 'endTime', e.target.value)} 
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          <Button onClick={handleSaveChanges} className="w-full mt-4 bg-accent hover:bg-accent/90">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
