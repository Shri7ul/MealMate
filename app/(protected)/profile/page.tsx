import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/features/auth/components/profile-form";
import { requireSessionProfile } from "@/services/auth/get-session-profile";

export const metadata = {
  title: "Profile"
};

export default async function ProfilePage() {
  const { profile } = await requireSessionProfile();

  return (
    <FadeIn>
      <PageHeader title="Profile" description="Manage your authenticated MealMate profile." />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>These fields are stored in the public users table.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </FadeIn>
  );
}
