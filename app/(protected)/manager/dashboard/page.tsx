import { redirect } from "next/navigation";
import { Building2, Users, Utensils } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getManagerMess, requireRole } from "@/services/auth/get-session-profile";
import { getMessMembers, getRecordCountSummary } from "@/services/mess/queries";
import Link from "next/link";

export const metadata = {
  title: "Manager Dashboard"
};

export default async function ManagerDashboardPage() {
  const { profile } = await requireRole("manager");
  const mess = await getManagerMess(profile.id);

  if (!mess) {
    redirect("/onboarding");
  }

  const [members, summary] = await Promise.all([
    getMessMembers(mess.id),
    getRecordCountSummary(mess.id)
  ]);

  return (
    <FadeIn>
      <PageHeader
        title="Manager Dashboard"
        description={`${mess.name} is connected to your manager account.`}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              Mess
            </CardTitle>
            <CardDescription>Active manager workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{mess.name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              Members
            </CardTitle>
            <CardDescription>Members assigned to this mess.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-2xl font-semibold">{members.length}</p>
            <Button asChild variant="outline">
              <Link href="/members">Open members</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="size-5 text-primary" />
              Meals
            </CardTitle>
            <CardDescription>Meal entry rows visible to this manager.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-2xl font-semibold">{summary.meals}</p>
            <Button asChild variant="outline">
              <Link href="/meals">Open meals</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  );
}
