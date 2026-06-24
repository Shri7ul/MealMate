import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { DepositManagement } from "@/features/mess/components/deposit-management";
import { getManagerMess, requireRole } from "@/services/auth/get-session-profile";
import { getDepositsForMess, getMessMembers } from "@/services/mess/queries";

export const metadata = {
  title: "Deposits"
};

export default async function ManagerDepositsPage() {
  const { profile } = await requireRole("manager");
  const mess = await getManagerMess(profile.id);

  if (!mess) {
    redirect("/onboarding");
  }

  const [members, deposits] = await Promise.all([
    getMessMembers(mess.id),
    getDepositsForMess(mess.id)
  ]);

  return (
    <FadeIn>
      <PageHeader
        title="Deposits"
        description={`Manage cash, Bkash, Nagad, and bank deposits for ${mess.name}.`}
      />
      <DepositManagement members={members} deposits={deposits} />
    </FadeIn>
  );
}
