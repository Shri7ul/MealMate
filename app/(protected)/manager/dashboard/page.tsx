import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { DashboardOverview } from "@/features/mess/components/dashboard-overview";
import { getManagerMess, requireRole } from "@/services/auth/get-session-profile";
import { getDashboardData } from "@/services/mess/queries";

export const metadata = {
  title: "Manager Dashboard"
};

export default async function ManagerDashboardPage() {
  const { profile } = await requireRole("manager");
  const mess = await getManagerMess(profile.id);

  if (!mess) {
    redirect("/onboarding");
  }

  const dashboardData = await getDashboardData(mess.id, profile.id);

  return (
    <FadeIn>
      <PageHeader
        title="Manager Dashboard"
        description={`${mess.name} live mess summary from Supabase records.`}
      />
      <DashboardOverview data={dashboardData} />
    </FadeIn>
  );
}
