"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/supabase/client";
import { getDashboardPath } from "@/lib/navigation";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import type { AppRole } from "@/types/database";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const next = searchParams.get("next");
  const supabase = useMemo(() => createClient(), []);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  function onSubmit(values: LoginValues) {
    setError(null);
    startTransition(async () => {
      const { error: signInError } = await supabase.auth.signInWithPassword(values);

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .single();

      if (profileError || !profile) {
        setError(profileError?.message ?? "Profile could not be loaded.");
        await supabase.auth.signOut();
        return;
      }

      const role = profile.role as AppRole;
      const fallbackPath = getDashboardPath(role);
      const targetPath = next?.startsWith("/") ? next : fallbackPath;

      router.replace(targetPath);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email ? <p className="text-sm text-primary">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password ? <p className="text-sm text-primary">{errors.password.message}</p> : null}
      </div>

      {error ? <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        <LogIn />
        {isPending ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
}
