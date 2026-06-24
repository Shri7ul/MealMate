import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { ExpenseManagement } from "@/features/mess/components/expense-management";
import { getManagerMess, requireRole } from "@/services/auth/get-session-profile";
import { getExpensesForMess } from "@/services/mess/queries";

export const metadata = {
  title: "Expenses"
};

export default async function ManagerExpensesPage() {
  const { profile } = await requireRole("manager");
  const mess = await getManagerMess(profile.id);

  if (!mess) {
    redirect("/onboarding");
  }

  const expenses = await getExpensesForMess(mess.id);

  return (
    <FadeIn>
      <PageHeader
        title="Expenses"
        description={`Manage bazaar, gas, electricity, internet, rent, and other expenses for ${mess.name}.`}
      />
      <ExpenseManagement expenses={expenses} />
    </FadeIn>
  );
}
