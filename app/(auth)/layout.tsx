import Link from "next/link";
import { Brand } from "@/components/layout/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen bg-background">
      <section className="hidden flex-1 border-r border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(255,91,91,0.2),transparent_34%)] p-10 lg:flex lg:flex-col">
        <Brand />
        <div className="mt-auto max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Supabase powered
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-normal">Secure mess operations</h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            MealMate keeps Manager and Member access separate with authenticated routes,
            database profiles, and row-level security.
          </p>
        </div>
      </section>
      <section className="flex min-h-screen flex-1 flex-col px-4 py-6 sm:px-6 lg:max-w-xl">
        <div className="flex items-center justify-between lg:hidden">
          <Brand />
          <Link href="/" className="text-sm text-muted-foreground">
            Home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">{children}</div>
      </section>
    </main>
  );
}
