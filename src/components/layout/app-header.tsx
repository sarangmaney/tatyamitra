"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { Logo } from "@/components/icons";
import { Menu, Bell } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export function AppHeader() {
  const pathname = usePathname();
  // isMobile from useSidebar context is derived from useIsMobile hook,
  // so it reflects viewport width and is suitable for adaptive UI rendering.
  const { toggleSidebar, isMobile } = useSidebar(); 

  const isDashboardPage = pathname.startsWith("/dashboard");

  // Determine if the brand (Logo + Title) should be shown.
  // Show if:
  // 1. We are on a desktop view (isMobile is false).
  // 2. OR We are on a mobile view AND not on a dashboard page 
  //    (on mobile dashboard, the menu icon is shown instead of the brand).
  const showBrand = !isMobile || (isMobile && !isDashboardPage);
  // This is equivalent to the original more succinct condition: !(isDashboardPage && isMobile)

  // Determine if the mobile menu toggle should be shown.
  // Show if:
  // 1. We are on a mobile view (isMobile is true).
  // 2. AND We are on a dashboard page.
  const showMobileMenuToggle = isMobile && isDashboardPage;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section: Mobile Menu Toggle or Brand */}
        <div className="flex items-center">
          {showMobileMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden" // Reinforces it's for mobile viewports
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          )}
          {showBrand && (
             <Link href={isDashboardPage ? "/dashboard" : "/"} className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="font-semibold text-xl text-foreground">
                Tatya Mitra
              </span>
            </Link>
          )}
        </div>

        {/* Right Section: Notifications and User Navigation */}
        <div className="flex items-center space-x-2">
          {!isMobile && ( // Bell icon only shown on desktop
            <Button variant="ghost" size="icon" title="View notifications">
              <Bell className="h-5 w-5" />
            </Button>
          )}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
