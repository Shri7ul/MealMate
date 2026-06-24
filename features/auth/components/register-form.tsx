"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/supabase/client";
import { getDashboardPath } from "@/lib/navigation";
import { registerSchema, type RegisterValues } from "@/features/auth/schemas";

export function RegisterForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "member",
      messName: ""
    }
  });

  const selectedRole = watch("role");

  function onSubmit(values: RegisterValues) {
    setError(null);
    startTransition(async () => {
      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            phone: values.phone || "",
            role: values.role,
            mess_name: values.messName || ""
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      router.replace(getDashboardPath(values.role));
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" {...register("name")} />
          {errors.name ? <p className="text-sm text-primary">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" autoComplete="tel" {...register("phone")} />
          {errors.phone ? <p className="text-sm text-primary">{errors.phone.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email ? <p className="text-sm text-primary">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password ? <p className="text-sm text-primary">{errors.password.message}</p> : null}
      </div>

      <div className="space-y-3">
        <Label>Account type</Label>
        <div className="grid grid-cols-2 gap-3">
          <label className="cursor-pointer">
            <input className="peer sr-only" type="radio" value="member" {...register("role")} />
            <span className="flex min-h-24 flex-col justify-between rounded-lg border border-border bg-card p-4 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary/10">
              <UserPlus className="size-5 text-primary" />
              <span className="font-medium">Member</span>
            </span>
          </label>
          <label className="cursor-pointer">
            <input className="peer sr-only" type="radio" value="manager" {...register("role")} />
            <span className="flex min-h-24 flex-col justify-between rounded-lg border border-border bg-card p-4 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary/10">
              <Building2 className="size-5 text-primary" />
              <span className="font-medium">Manager</span>
            </span>
          </label>
        </div>
      </div>

      {selectedRole === "manager" ? (
        <div className="space-y-2">
          <Label htmlFor="messName">Mess name</Label>
          <Input id="messName" autoComplete="organization" {...register("messName")} />
          {errors.messName ? <p className="text-sm text-primary">{errors.messName.message}</p> : null}
        </div>
      ) : null}

      {error ? <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        <UserPlus />
        {isPending ? "Creating account" : "Create account"}
      </Button>
    </form>
  );
}
