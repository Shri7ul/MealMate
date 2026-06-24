import { requireRole } from "@/services/auth/get-session-profile";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("manager");
  return children;
}
