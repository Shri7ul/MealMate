import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Topbar } from "@/components/layout/topbar";
import type { UserProfile } from "@/types/auth";

export function AppShell({
  profile,
  children
}: {
  profile: UserProfile;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar profile={profile} />
      <div className="lg:pl-72">
        <Topbar profile={profile} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileNav role={profile.role} />
    </div>
  );
}
