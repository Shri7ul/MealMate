import { Utensils, WalletCards } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMemberMess, requireRole } from "@/services/auth/get-session-profile";
import { getRecordCountSummary } from "@/services/mess/queries";

export const metadata = {
  title: "Member Dashboard"
};

export default async function MemberDashboardPage() {
  const { profile } = await requireRole("member");
  const mess = await getMemberMess(profile.id);
  const summary = mess ? await getRecordCountSummary(mess.id) : null;

  return (
    <FadeIn>
      <PageHeader
        title="Member Dashboard"
        description={
          mess
            ? `${mess.name} is connected to your account.`
            : "Your account is ready. A manager must add you to a mess before records appear."
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="size-5 text-primary" />
              Meal access
            </CardTitle>
            <CardDescription>Members can view meal history after assignment.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {mess ? "Meal records are scoped to your mess by RLS." : "No mess membership is attached yet."}
            </p>
            {summary ? <p className="mt-4 text-2xl font-semibold">{summary.meals}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletCards className="size-5 text-primary" />
              Balance access
            </CardTitle>
            <CardDescription>Deposits, expenses, and balance are read-only for members.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The database policies already prevent member writes.
            </p>
            {summary ? (
              <p className="mt-4 text-2xl font-semibold">
                {summary.deposits + summary.expenses + summary.reports}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  );
}
