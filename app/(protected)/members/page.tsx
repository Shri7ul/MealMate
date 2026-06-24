import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { requireSessionProfile } from "@/services/auth/get-session-profile";
import { getAccessibleMess, getMessMembers } from "@/services/mess/queries";

export const metadata = {
  title: "Members"
};

export default async function MembersPage() {
  const { profile } = await requireSessionProfile();
  const mess = await getAccessibleMess(profile.id, profile.role);
  const members = mess ? await getMessMembers(mess.id) : [];

  return (
    <FadeIn>
      <PageHeader
        title="Members"
        description={
          mess
            ? `Member list for ${mess.name}.`
            : "No mess is connected to this account yet."
        }
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Member list
          </CardTitle>
          <CardDescription>Rows are read from Supabase members and users tables.</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.users?.avatar ?? undefined} alt={member.users?.name ?? "Member"} />
                      <AvatarFallback>{getInitials(member.users?.name ?? "Member")}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{member.users?.name ?? "Unknown member"}</p>
                      <p className="truncate text-xs text-muted-foreground">{member.users?.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Joined {new Date(member.joined_at).toLocaleDateString("en-BD")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {mess ? "No members are assigned yet." : "Connect to a mess to view members."}
            </p>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}
