import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessForm } from "@/features/mess/components/mess-form";
import { getManagerMess, requireSessionProfile } from "@/services/auth/get-session-profile";

export const metadata = {
  title: "Settings"
};

export default async function SettingsPage() {
  const { profile } = await requireSessionProfile();
  const mess = profile.role === "manager" ? await getManagerMess(profile.id) : null;

  return (
    <FadeIn>
      <PageHeader title="Settings" description="Account role, access, and workspace configuration." />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Access
            </CardTitle>
            <CardDescription>Role is enforced by Supabase RLS policies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-muted-foreground">Current role</span>
              <Badge className="capitalize">{profile.role}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="max-w-48 truncate text-sm">{profile.email}</span>
            </div>
          </CardContent>
        </Card>

        {profile.role === "manager" ? (
          <Card>
            <CardHeader>
              <CardTitle>Mess settings</CardTitle>
              <CardDescription>Create or rename your managed mess.</CardDescription>
            </CardHeader>
            <CardContent>
              <MessForm defaultName={mess?.name ?? ""} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Member settings</CardTitle>
              <CardDescription>Members receive mess access only after manager assignment.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Member accounts are read-only for operational records by design.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </FadeIn>
  );
}
