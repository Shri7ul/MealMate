import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { EmptyState } from "@/components/common/empty-state";
import { ReportManagement } from "@/features/mess/components/report-management";
import { requireSessionProfile } from "@/services/auth/get-session-profile";
import { getAccessibleMess, getMonthlyReportData, getReportsForMess } from "@/services/mess/queries";

export const metadata = {
  title: "Monthly Reports"
};

export default async function ReportsPage() {
  const { profile } = await requireSessionProfile();

  if (profile.role === "manager") {
    redirect("/manager/reports");
  }

  const mess = await getAccessibleMess(profile.id, profile.role);
  const now = new Date();
  const [summary, reports] = mess
    ? await Promise.all([
        getMonthlyReportData(mess.id, now.getMonth() + 1, now.getFullYear()),
        getReportsForMess(mess.id)
      ])
    : [null, []];

  return (
    <FadeIn>
      <PageHeader
        title="Monthly Reports"
        description={mess ? `Monthly reports for ${mess.name}.` : "No mess is connected to this account yet."}
      />
      {mess && summary ? (
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
      ) : (
        <EmptyState
          title="No mess connected"
          description="You will see monthly reports after a manager adds you to a mess."
        />
      )}
    </FadeIn>
  );
}
