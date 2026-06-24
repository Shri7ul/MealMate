import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { EmptyState } from "@/components/common/empty-state";
import { MemberDashboardOverview } from "@/features/mess/components/member-dashboard-overview";
import { getMemberMess, requireRole } from "@/services/auth/get-session-profile";
import { getPersonalBalanceSummary } from "@/services/mess/queries";

export const metadata = {
  title: "Member Dashboard"
};

export default async function MemberDashboardPage() {
  const { profile } = await requireRole("member");
  const mess = await getMemberMess(profile.id);
  const summary = mess ? await getPersonalBalanceSummary(mess.id, profile.id) : null;

  return (
    <FadeIn>
      <PageHeader
        title="Member Dashboard"
        description={
          mess
            ? `${mess.name} is connected to your account.`
            : "Your account is ready. A manager must add you to a mess before records appear."
          }
      />
      {summary ? (
        <MemberDashboardOverview summary={summary} />
      ) : (
        <EmptyState
          title="No member records yet"
          description="A manager must add your account to a mess before meals, deposits, and balances appear."
        />
      )}
    </FadeIn>
  );
}
