import { AppShell } from "@/components/layout/app-shell";
import { requireSessionProfile } from "@/services/auth/get-session-profile";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireSessionProfile();

  return <AppShell profile={profile}>{children}</AppShell>;
}
