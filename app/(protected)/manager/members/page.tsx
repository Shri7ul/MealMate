import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { MemberManagement } from "@/features/mess/components/member-management";
import { getManagerMess, requireRole } from "@/services/auth/get-session-profile";
import { getMessMemberSummaries } from "@/services/mess/queries";

export const metadata = {
  title: "Members"
};

export default async function ManagerMembersPage() {
  const { profile } = await requireRole("manager");
  const mess = await getManagerMess(profile.id);

  if (!mess) {
    redirect("/onboarding");
  }

  const members = await getMessMemberSummaries(mess.id);

  return (
    <FadeIn>
      <PageHeader
        title="Members"
        description={`Manage member records, balances, and contact details for ${mess.name}.`}
      />
      <MemberManagement members={members} />
    </FadeIn>
  );
}
