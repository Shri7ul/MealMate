import { Bell } from "lucide-react";
import Link from "next/link";
import { AccountMenu } from "@/components/layout/account-menu";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/types/auth";

export function Topbar({ profile }: { profile: UserProfile }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur lg:pl-6">
      <div className="flex items-center justify-between gap-4">
        <div className="lg:hidden">
          <Brand href={profile.role === "manager" ? "/manager/dashboard" : "/member/dashboard"} />
        </div>
        <div className="hidden lg:block">
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <p className="text-lg font-semibold">{profile.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Notifications">
            <Link href="/notifications">
              <Bell />
            </Link>
          </Button>
          <AccountMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}
