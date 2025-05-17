
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { Logo } from "@/components/icons";
import { Menu, Bell } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const pathname = usePathname();
  const { toggleSidebar, isMobile } = useSidebar(); 

  const isDashboardPage = pathname.startsWith("/dashboard");

  // Determine if the brand (Logo + Title) should be shown.
  const showBrand = !isMobile || (isMobile && !isDashboardPage);
  // Determine if the mobile menu toggle should be shown.
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
              className="md:hidden" 
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
          {!isMobile && ( 
            <Button variant="ghost" size="icon" title="View notifications">
              <Bell className="h-5 w-5" />
            </Button>
          )}
          <UserNav />
        </div>
      </div>

      {/* Conditional Dashboard Welcome Message */}
      {isDashboardPage && (
        <div className="bg-background border-b border-t"> {/* Added border-t for separation */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Welcome to Tatya Mitra!</h1>
            <p className="text-sm text-muted-foreground">Here&apos;s an overview of your activities.</p>
          </div>
        </div>
      )}
    </header>
  );
}
