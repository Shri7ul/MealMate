import { BellRing } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { SummaryCard } from "@/components/common/summary-card";
import { Badge } from "@/components/ui/badge";
import { requireSessionProfile } from "@/services/auth/get-session-profile";
import { countUnreadNotifications } from "@/services/mess/queries";

export const metadata = {
  title: "Notifications"
};

export default async function NotificationsPage() {
  const { profile } = await requireSessionProfile();
  const unreadCount = await countUnreadNotifications(profile.id);

  return (
    <FadeIn>
      <PageHeader
        title="Notifications"
        description="Unread counts are read from your Supabase notifications."
      />
      <SummaryCard
        title="Notification center"
        description="Current unread count is queried from Supabase notifications."
        icon={BellRing}
      >
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <span className="text-sm text-muted-foreground">Unread notifications</span>
          <Badge>{unreadCount}</Badge>
        </div>
      </SummaryCard>
    </FadeIn>
  );
}
