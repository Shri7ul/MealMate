import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { EmptyState } from "@/components/common/empty-state";
import { MemberManagement } from "@/features/mess/components/member-management";
import { requireSessionProfile } from "@/services/auth/get-session-profile";
import { getAccessibleMess, getMessMemberSummaries } from "@/services/mess/queries";

export const metadata = {
  title: "Members"
};

export default async function MembersPage() {
  const { profile } = await requireSessionProfile();

  if (profile.role === "manager") {
    redirect("/manager/members");
  }

  const mess = await getAccessibleMess(profile.id, profile.role);
  const members = mess ? await getMessMemberSummaries(mess.id) : [];

  return (
    <FadeIn>
      <PageHeader
        title="Members"
        description={
          mess
            ? `Member list for ${mess.name}.`
            : "No mess is connected to this account yet."
          }
      />
      {mess ? (
        <MemberManagement members={members} readOnly />
      ) : (
        <EmptyState
          title="No mess connected"
          description="You will see members here after a manager adds you to a mess."
        />
      )}
    </FadeIn>
  );
}
