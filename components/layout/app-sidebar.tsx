import { Brand } from "@/components/layout/brand";
import { NavLink } from "@/components/layout/nav-link";
import { Separator } from "@/components/ui/separator";
import { getNavigationForRole } from "@/lib/navigation";
import type { UserProfile } from "@/types/auth";

export function AppSidebar({ profile }: { profile: UserProfile }) {
  const navigation = getNavigationForRole(profile.role);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border/70 bg-background/95 p-5 backdrop-blur lg:block">
      <div className="flex h-full flex-col">
        <Brand href={profile.role === "manager" ? "/manager/dashboard" : "/member/dashboard"} />
        <Separator className="my-5" />
        <nav className="flex flex-1 flex-col gap-1">
          {navigation.map((item) => (
            <NavLink key={`${item.title}-${item.href}`} item={item} />
          ))}
        </nav>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium">Role</p>
          <p className="mt-1 text-sm capitalize text-muted-foreground">{profile.role}</p>
        </div>
      </div>
    </aside>
  );
}
