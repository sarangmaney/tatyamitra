
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import NavLink from "@/components/layout/nav-link"; // Import NavLink
import { UserNav } from "@/components/layout/user-nav";
import { Logo } from "@/components/icons";
import {
  LayoutDashboard,
  Tractor,
  CalendarDays,
  ClipboardList,
  Wand2,
  SettingsIcon,
  LogOut,
  Menu,
  LockIcon,
  UnlockIcon,
  UserSquare, // Added UserSquare icon
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/equipment", label: "Equipment", icon: Tractor },
  { href: "/dashboard/availability", label: "Availability", icon: CalendarDays },
  { href: "/dashboard/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/dashboard/pricing-tool", label: "Pricing Tool", icon: Wand2 },
  { href: "/portfolio/vendor_12345xyz", label: "Portfolio", icon: UserSquare }, // Added Portfolio link
  { href: "/dashboard/vendors", label: "Vendors", icon: LockIcon, passwordProtected: true },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

function DashboardSidebar() {
  const pathname = usePathname();
  const { open, setOpen, isMobile } = useSidebar();

  const [password, setPassword] = React.useState("");
  const [isLocked, setIsLocked] = React.useState(true);

  const handlePasswordSubmit = (href: string) => {
    if (password === "9595") {
      setIsLocked(false);
    } else {
      alert("Incorrect password");
    }
  };

  return (
    <Sidebar
      variant="sidebar" // Use 'sidebar' variant for persistent sidebar look
      collapsible={isMobile ? "offcanvas" : "icon"}
      className="border-r"
    >
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className={cn(
            "font-semibold text-xl text-foreground",
            !open && !isMobile && "hidden" // Hide text when collapsed on desktop
          )}>Tatya Mitra</span>
        </Link>
        {!isMobile && <SidebarTrigger className="hidden group-data-[collapsible=icon]:hidden" />}
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
 {navItems.map((item) => (
 <SidebarMenuItem key={item.href}>
 {item.passwordProtected ? (
 <>
 {isLocked ? (
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <LockIcon className="h-5 w-5" />
 <span className={cn(!open && !isMobile && "hidden")}>{item.label}</span>
 </div>
 <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ml-2 p-1 border rounded text-sm"
                />
 <Button size="sm" onClick={() => handlePasswordSubmit(item.href)} className="ml-2">
                  Unlock
 </Button>
 </div>
 ) : (
 <Link href={item.href} passHref legacyBehavior>
 <SidebarMenuButton
 isActive={pathname === item.href || (item.href !== "/dashboard" && item.href !== "/portfolio/vendor_12345xyz" && pathname.startsWith(item.href)) || (item.href === "/portfolio/vendor_12345xyz" && pathname.startsWith("/portfolio")) || (item.passwordProtected && pathname.startsWith(item.href))}
 tooltip={{ children: item.label, side: "right", align: "center"}}
 onClick={() => isMobile && setOpen(false)}
 className="justify-start"
 >
 <UnlockIcon className="h-5 w-5" />
 <span className={cn(!open && !isMobile && "hidden")}>{item.label}</span>
 </SidebarMenuButton>
 </Link>
 )}
 </>
 ) : (
 <NavLink item={item} pathname={pathname} isMobile={isMobile} setOpen={setOpen} open={open} />
 )}
 </SidebarMenuItem>
 ))}

        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto border-t">
         <Link href="/" passHref legacyBehavior>
            <SidebarMenuButton className="justify-start">
                <LogOut className="h-5 w-5" />
                <span className={cn(!open && !isMobile && "hidden")}>Logout</span>
            </SidebarMenuButton>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

function DashboardHeader() {
    const { toggleSidebar, isMobile } = useSidebar();
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            {isMobile && (
                 <Button variant="outline" size="icon" onClick={toggleSidebar} className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            )}
            <div className="flex-1">
                {/* Optional: Add breadcrumbs or page title here */}
            </div>
            <UserNav />
        </header>
    );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardSidebar />
      <SidebarInset className="flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
