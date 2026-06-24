"use client";

import {
  Bell,
  ChartNoAxesCombined,
  CreditCard,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Users,
  Utensils,
  UserRound
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavIconName, NavItem } from "@/lib/navigation";

const navIcons: Record<NavIconName, typeof LayoutDashboard> = {
  bell: Bell,
  chart: ChartNoAxesCombined,
  "credit-card": CreditCard,
  dashboard: LayoutDashboard,
  receipt: ReceiptText,
  settings: Settings,
  users: Users,
  utensils: Utensils,
  user: UserRound
};

export function NavLink({ item, compact = false }: { item: NavItem; compact?: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = navIcons[item.icon];

  if (compact) {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-medium text-muted-foreground transition-colors",
          isActive && "bg-primary/10 text-primary"
        )}
      >
        <Icon className="size-5" />
        <span className="max-w-full truncate">{item.title}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-primary/10 text-primary"
      )}
    >
      <Icon className="size-4" />
      {item.title}
    </Link>
  );
}
