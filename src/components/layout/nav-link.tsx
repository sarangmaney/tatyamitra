
"use client";

import Link from "next/link";
import type * as React from 'react'; // For React.ElementType
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType; // Accepts Lucide icons directly
  passwordProtected?: boolean;
}

interface NavLinkProps {
  item: NavItem;
  pathname: string;
  isMobile: boolean;
  setOpen: (open: boolean) => void;
  open: boolean;
}

export default function NavLink({ item, pathname, isMobile, setOpen, open }: NavLinkProps) {
  const Icon = item.icon;

  // Enhanced isActive logic to correctly handle base dashboard and portfolio routes
  const isPortfolioPath = item.href.startsWith("/portfolio/") && pathname.startsWith("/portfolio");
  const isStrictDashboardPath = item.href === "/dashboard" && pathname === "/dashboard";
  const isOtherDashboardPath = item.href.startsWith("/dashboard/") && item.href !== "/dashboard" && pathname.startsWith(item.href);
  
  const isActive = isStrictDashboardPath || isPortfolioPath || isOtherDashboardPath;


  return (
    <Link href={item.href} passHref legacyBehavior>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={{ children: item.label, side: "right", align: "center" }}
        onClick={() => {
          if (isMobile) {
            setOpen(false);
          }
        }}
        className="justify-start"
      >
        <Icon className="h-5 w-5" />
        <span className={cn(!open && !isMobile && "hidden")}>{item.label}</span>
      </SidebarMenuButton>
    </Link>
  );
}
