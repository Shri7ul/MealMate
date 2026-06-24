import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { MealManagement } from "@/features/mess/components/meal-management";
import { getManagerMess, requireRole } from "@/services/auth/get-session-profile";
import { getMealEntriesForMess, getMessMembers } from "@/services/mess/queries";

export const metadata = {
  title: "Meals"
};

export default async function ManagerMealsPage() {
  const { profile } = await requireRole("manager");
  const mess = await getManagerMess(profile.id);

  if (!mess) {
    redirect("/onboarding");
  }

  const [members, meals] = await Promise.all([
    getMessMembers(mess.id),
    getMealEntriesForMess(mess.id)
  ]);

  return (
    <FadeIn>
      <PageHeader
        title="Meals"
        description={`Daily meal entry, history, and member-wise meal totals for ${mess.name}.`}
      />
      <MealManagement members={members} meals={meals} />
    </FadeIn>
  );
}
