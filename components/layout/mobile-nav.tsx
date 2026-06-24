import { NavLink } from "@/components/layout/nav-link";
import { getNavigationForRole } from "@/lib/navigation";
import type { AppRole } from "@/types/database";

const mobileOrder = ["Dashboard", "Meals", "Deposits", "Reports", "Notifications"];

export function MobileNav({ role }: { role: AppRole }) {
  const navigation = getNavigationForRole(role)
    .filter((item) => mobileOrder.includes(item.title))
    .sort((a, b) => mobileOrder.indexOf(a.title) - mobileOrder.indexOf(b.title));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl gap-1">
        {navigation.map((item) => (
          <NavLink key={`${item.title}-${item.href}`} item={item} compact />
        ))}
      </div>
    </nav>
  );
}
