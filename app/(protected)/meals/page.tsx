import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { EmptyState } from "@/components/common/empty-state";
import { MealManagement } from "@/features/mess/components/meal-management";
import { requireSessionProfile } from "@/services/auth/get-session-profile";
import { getAccessibleMess, getMealEntriesForMess, getMessMembers } from "@/services/mess/queries";

export const metadata = {
  title: "Meals"
};

export default async function MealsPage() {
  const { profile } = await requireSessionProfile();

  if (profile.role === "manager") {
    redirect("/manager/meals");
  }

  const mess = await getAccessibleMess(profile.id, profile.role);
  const [members, meals] = mess
    ? await Promise.all([getMessMembers(mess.id), getMealEntriesForMess(mess.id)])
    : [[], []];

  return (
    <FadeIn>
      <PageHeader
        title="Meals"
        description={
          mess
            ? `Meal records for ${mess.name}.`
            : "No mess is connected to this account yet."
        }
      />
      {mess ? (
        <MealManagement members={members} meals={meals} readOnly />
      ) : (
        <EmptyState
          title="No mess connected"
          description="You will see meal records after a manager adds you to a mess."
        />
      )}
    </FadeIn>
  );
}
