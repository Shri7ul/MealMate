import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BellRing, ChartNoAxesCombined, ShieldCheck, Utensils } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardPath } from "@/lib/navigation";
import { getSessionProfile } from "@/services/auth/get-session-profile";

const highlights = [
  {
    title: "Meal operations",
    description: "Record breakfast, lunch, and dinner with manager-controlled permissions.",
    icon: Utensils
  },
  {
    title: "Live notifications",
    description: "Members receive realtime updates for meals, deposits, expenses, and reports.",
    icon: BellRing
  },
  {
    title: "Monthly accounting",
    description: "Meal rate, member cost, deposits, and balances are calculated from real records.",
    icon: ChartNoAxesCombined
  },
  {
    title: "Database security",
    description: "Supabase Auth and row-level security protect every role boundary.",
    icon: ShieldCheck
  }
];

export default async function LandingPage() {
  const sessionProfile = await getSessionProfile();

  if (sessionProfile) {
    redirect(getDashboardPath(sessionProfile.role));
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <section className="relative flex min-h-screen flex-col px-4 py-5 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,91,91,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_32%)]" />
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Brand />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </nav>

        <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-8 py-10 lg:grid-cols-[1fr_0.9fr]">
          <FadeIn>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Mess management
              </p>
              <h1 className="mt-5 text-5xl font-semibold tracking-normal text-foreground sm:text-6xl lg:text-7xl">
                MealMate
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                A secure, manager-led platform for student mess meals, deposits, expenses,
                notifications, and monthly reports.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/register">
                    Start with Supabase
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Open workspace</Link>
                </Button>
              </div>
            </div>
          </FadeIn>

          <FadeIn className="grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="bg-card/75">
                  <CardContent className="p-5">
                    <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
