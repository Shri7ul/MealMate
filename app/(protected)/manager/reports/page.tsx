import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { ReportManagement } from "@/features/mess/components/report-management";
import { getManagerMess, requireRole } from "@/services/auth/get-session-profile";
import { getMonthlyReportData, getReportsForMess } from "@/services/mess/queries";

export const metadata = {
  title: "Reports"
};

export default async function ManagerReportsPage() {
  const { profile } = await requireRole("manager");
  const mess = await getManagerMess(profile.id);

  if (!mess) {
    redirect("/onboarding");
  }

  const now = new Date();
  const [summary, reports] = await Promise.all([
    getMonthlyReportData(mess.id, now.getMonth() + 1, now.getFullYear()),
    getReportsForMess(mess.id)
  ]);

  return (
    <FadeIn>
      <PageHeader
        title="Reports"
        description={`Monthly summary, meal rate, and member balances for ${mess.name}.`}
      />
      <ReportManagement
        reports={reports}
        summary={{
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          totalMembers: summary.totalMembers,
          totalMeals: summary.totalMeals,
          totalDeposits: summary.totalDeposits,
          totalExpenses: summary.totalExpenses,
          mealRate: summary.mealRate,
          balance: summary.balance,
          memberBalances: summary.memberBalances.map((item) => ({
            name: item.member.users?.name ?? "Unknown member",
            meals: item.meals,
            deposits: item.deposits,
            balance: item.balance
          }))
        }}
      />
    </FadeIn>
  );
}
