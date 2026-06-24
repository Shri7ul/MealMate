import { ReceiptText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { SummaryCard } from "@/components/common/summary-card";
import { requireSessionProfile } from "@/services/auth/get-session-profile";
import { countExpensesForMess, getAccessibleMess } from "@/services/mess/queries";

export const metadata = {
  title: "Expenses"
};

export default async function ExpensesPage() {
  const { profile } = await requireSessionProfile();
  const mess = await getAccessibleMess(profile.id, profile.role);
  const expenseCount = mess ? await countExpensesForMess(mess.id) : 0;

  return (
    <FadeIn>
      <PageHeader
        title="Expenses"
        description={mess ? `Expense records for ${mess.name}.` : "No mess is connected to this account yet."}
      />
      <SummaryCard
        title="Expense records"
        description="Records are read from the expenses table through Supabase RLS."
        icon={ReceiptText}
      >
        <p className="text-3xl font-semibold">{expenseCount}</p>
        <p className="mt-2 text-sm text-muted-foreground">Visible expense records</p>
      </SummaryCard>
    </FadeIn>
  );
}
