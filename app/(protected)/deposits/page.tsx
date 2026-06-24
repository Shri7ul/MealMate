import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { EmptyState } from "@/components/common/empty-state";
import { DepositManagement } from "@/features/mess/components/deposit-management";
import { requireSessionProfile } from "@/services/auth/get-session-profile";
import { getAccessibleMess, getDepositsForMess, getMessMembers } from "@/services/mess/queries";

export const metadata = {
  title: "Deposits"
};

export default async function DepositsPage() {
  const { profile } = await requireSessionProfile();

  if (profile.role === "manager") {
    redirect("/manager/deposits");
  }

  const mess = await getAccessibleMess(profile.id, profile.role);
  const [members, deposits] = mess
    ? await Promise.all([getMessMembers(mess.id), getDepositsForMess(mess.id)])
    : [[], []];

  return (
    <FadeIn>
      <PageHeader
        title="Deposits"
        description={mess ? `Deposit records for ${mess.name}.` : "No mess is connected to this account yet."}
      />
      {mess ? (
        <DepositManagement members={members} deposits={deposits} readOnly />
      ) : (
        <EmptyState
          title="No mess connected"
          description="You will see deposits after a manager adds you to a mess."
        />
      )}
    </FadeIn>
  );
}
