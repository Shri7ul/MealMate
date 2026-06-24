import { requireRole } from "@/services/auth/get-session-profile";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  await requireRole("member");
  return children;
}
