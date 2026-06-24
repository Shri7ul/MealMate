import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { SummaryCard } from "@/components/common/summary-card";
import { requireSessionProfile } from "@/services/auth/get-session-profile";
import { countDepositsForMess, getAccessibleMess } from "@/services/mess/queries";

export const metadata = {
  title: "Deposits"
};

export default async function DepositsPage() {
  const { profile } = await requireSessionProfile();
  const mess = await getAccessibleMess(profile.id, profile.role);
  const depositCount = mess ? await countDepositsForMess(mess.id) : 0;

  return (
    <FadeIn>
      <PageHeader
        title="Deposits"
        description={mess ? `Deposit records for ${mess.name}.` : "No mess is connected to this account yet."}
      />
      <SummaryCard
        title="Deposit records"
        description="Records are read from the deposits table through Supabase RLS."
        icon={CreditCard}
      >
        <p className="text-3xl font-semibold">{depositCount}</p>
        <p className="mt-2 text-sm text-muted-foreground">Visible deposit records</p>
      </SummaryCard>
    </FadeIn>
  );
}
