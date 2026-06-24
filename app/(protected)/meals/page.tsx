import { Utensils } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { SummaryCard } from "@/components/common/summary-card";
import { requireSessionProfile } from "@/services/auth/get-session-profile";
import { countMealsForMess, getAccessibleMess } from "@/services/mess/queries";

export const metadata = {
  title: "Meals"
};

export default async function MealsPage() {
  const { profile } = await requireSessionProfile();
  const mess = await getAccessibleMess(profile.id, profile.role);
  const mealCount = mess ? await countMealsForMess(mess.id) : 0;

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
      <SummaryCard
        title="Meal entries"
        description="Records are read from the meal_entries table through Supabase RLS."
        icon={Utensils}
      >
        <p className="text-3xl font-semibold">{mealCount}</p>
        <p className="mt-2 text-sm text-muted-foreground">Visible meal records</p>
      </SummaryCard>
    </FadeIn>
  );
}
