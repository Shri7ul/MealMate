import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessForm } from "@/features/mess/components/mess-form";
import { getManagerMess, requireRole } from "@/services/auth/get-session-profile";

export const metadata = {
  title: "Mess Setup"
};

export default async function OnboardingPage() {
  const { profile } = await requireRole("manager");
  const mess = await getManagerMess(profile.id);

  if (mess) {
    redirect("/manager/dashboard");
  }

  return (
    <FadeIn>
      <PageHeader
        title="Create your mess"
        description="A manager account needs one mess before members, meals, deposits, expenses, and reports can be managed."
      />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Mess details</CardTitle>
          <CardDescription>This creates a real row in Supabase under your manager account.</CardDescription>
        </CardHeader>
        <CardContent>
          <MessForm />
        </CardContent>
      </Card>
    </FadeIn>
  );
}
