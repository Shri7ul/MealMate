import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { EmptyState } from "@/components/common/empty-state";
import { ExpenseManagement } from "@/features/mess/components/expense-management";
import { requireSessionProfile } from "@/services/auth/get-session-profile";
import { getAccessibleMess, getExpensesForMess } from "@/services/mess/queries";

export const metadata = {
  title: "Expenses"
};

export default async function ExpensesPage() {
  const { profile } = await requireSessionProfile();

  if (profile.role === "manager") {
    redirect("/manager/expenses");
  }

  const mess = await getAccessibleMess(profile.id, profile.role);
  const expenses = mess ? await getExpensesForMess(mess.id) : [];

  return (
    <FadeIn>
      <PageHeader
        title="Expenses"
        description={mess ? `Expense records for ${mess.name}.` : "No mess is connected to this account yet."}
      />
      {mess ? (
        <ExpenseManagement expenses={expenses} readOnly />
      ) : (
        <EmptyState
          title="No mess connected"
          description="You will see expenses after a manager adds you to a mess."
        />
      )}
    </FadeIn>
  );
}
