import type { AppRole } from "@/types/database";

export type NavIconName =
  | "bell"
  | "chart"
  | "credit-card"
  | "dashboard"
  | "receipt"
  | "settings"
  | "users"
  | "utensils"
  | "user";

export interface NavItem {
  title: string;
  href: string;
  icon: NavIconName;
  roles: AppRole[];
}

export const appNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/manager/dashboard",
    icon: "dashboard",
    roles: ["manager"]
  },
  {
    title: "Dashboard",
    href: "/member/dashboard",
    icon: "dashboard",
    roles: ["member"]
  },
  {
    title: "Meals",
    href: "/meals",
    icon: "utensils",
    roles: ["manager", "member"]
  },
  {
    title: "Deposits",
    href: "/deposits",
    icon: "credit-card",
    roles: ["manager", "member"]
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: "receipt",
    roles: ["manager", "member"]
  },
  {
    title: "Members",
    href: "/members",
    icon: "users",
    roles: ["manager", "member"]
  },
  {
    title: "Reports",
    href: "/reports",
    icon: "chart",
    roles: ["manager", "member"]
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: "bell",
    roles: ["manager", "member"]
  },
  {
    title: "Profile",
    href: "/profile",
    icon: "user",
    roles: ["manager", "member"]
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "settings",
    roles: ["manager", "member"]
  }
];

export function getNavigationForRole(role: AppRole) {
  return appNavigation.filter((item) => item.roles.includes(role));
}

export function getDashboardPath(role: AppRole) {
  return role === "manager" ? "/manager/dashboard" : "/member/dashboard";
}
