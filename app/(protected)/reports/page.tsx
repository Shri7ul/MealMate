import { ChartNoAxesCombined } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { SummaryCard } from "@/components/common/summary-card";
import { requireSessionProfile } from "@/services/auth/get-session-profile";
import { countReportsForMess, getAccessibleMess } from "@/services/mess/queries";

export const metadata = {
  title: "Monthly Reports"
};

export default async function ReportsPage() {
  const { profile } = await requireSessionProfile();
  const mess = await getAccessibleMess(profile.id, profile.role);
  const reportCount = mess ? await countReportsForMess(mess.id) : 0;

  return (
    <FadeIn>
      <PageHeader
        title="Monthly Reports"
        description={mess ? `Monthly reports for ${mess.name}.` : "No mess is connected to this account yet."}
      />
      <SummaryCard
        title="Monthly reports"
        description="Records are read from the monthly_reports table through Supabase RLS."
        icon={ChartNoAxesCombined}
      >
        <p className="text-3xl font-semibold">{reportCount}</p>
        <p className="mt-2 text-sm text-muted-foreground">Visible monthly reports</p>
      </SummaryCard>
    </FadeIn>
  );
}
