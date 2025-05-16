
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  bio: z.string().max(200, "Bio must be under 200 characters.").optional(),
  avatarUrl: z.string().url("Please enter a valid URL for avatar.").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const notificationSettingsSchema = z.object({
  newBookings: z.boolean().default(true),
  bookingUpdates: z.boolean().default(true),
  promotionalEmails: z.boolean().default(false),
});

type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;


export default function SettingsPage() {
  const { toast } = useToast();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "GreenAcres Vendor",
      email: "vendor@greenacres.com",
      phone: "1234567890",
      bio: "Your trusted partner for quality agricultural equipment and services.",
      avatarUrl: "https://placehold.co/100x100.png",
    },
  });

  const notificationForm = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      newBookings: true,
      bookingUpdates: true,
      promotionalEmails: false,
    },
  });


  const onProfileSubmit = (data: ProfileFormValues) => {
    console.log("Profile data submitted:", data);
    // In a real app, you would update Firestore here with data from `vendor_12345xyz`
    toast({ title: "Profile Updated", description: "Your profile information has been saved." });
  };

  const onNotificationsSubmit = (data: NotificationSettingsValues) => {
    console.log("Notification settings submitted:", data);
    toast({ title: "Notifications Updated", description: "Your notification preferences have been saved." });
  };

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences.</p>
      </div>

      {/* Profile Settings Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Vendor Profile Information</CardTitle>
          <CardDescription>Update your vendor details and profile picture.</CardDescription>
        </CardHeader>
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileForm.watch("avatarUrl") || "https://placehold.co/100x100.png"} alt="Vendor Avatar" data-ai-hint="vendor logo" />
                  <AvatarFallback>{profileForm.watch("fullName")?.substring(0,2).toUpperCase() || "GV"}</AvatarFallback>
                </Avatar>
                <FormField
                  control={profileForm.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/avatar.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={profileForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name / Company Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input type="tel" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={profileForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Bio / Description</FormLabel>
                    <FormControl><Textarea placeholder="Tell us a little about your vendor services." className="resize-none" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="bg-accent hover:bg-accent/90">Save Profile</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Notification Settings Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Choose how you want to be notified.</CardDescription>
        </CardHeader>
        <Form {...notificationForm}>
          <form onSubmit={notificationForm.handleSubmit(onNotificationsSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={notificationForm.control}
                name="newBookings"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">New Bookings</FormLabel>
                      <FormDescription>Receive notifications for new booking requests.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="bookingUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Booking Updates</FormLabel>
                      <FormDescription>Get updates on confirmed or cancelled bookings.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="promotionalEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Promotional Emails</FormLabel>
                      <FormDescription>Receive emails about new features and offers.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="bg-accent hover:bg-accent/90">Save Notification Preferences</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
