"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/features/auth/actions";
import { profileSchema, type ProfileValues } from "@/features/auth/schemas";
import type { UserProfile } from "@/types/auth";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone ?? "",
      avatar: profile.avatar ?? ""
    }
  });

  function onSubmit(values: ProfileValues) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateProfileAction(values);
      setMessage(result.message);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="profile-name">Name</Label>
        <Input id="profile-name" autoComplete="name" {...register("name")} />
        {errors.name ? <p className="text-sm text-primary">{errors.name.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-phone">Phone</Label>
        <Input id="profile-phone" autoComplete="tel" {...register("phone")} />
        {errors.phone ? <p className="text-sm text-primary">{errors.phone.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-avatar">Avatar URL</Label>
        <Input id="profile-avatar" type="url" {...register("avatar")} />
        {errors.avatar ? <p className="text-sm text-primary">{errors.avatar.message}</p> : null}
      </div>

      {message ? <p className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">{message}</p> : null}

      <Button type="submit" disabled={isPending}>
        <Save />
        {isPending ? "Saving" : "Save profile"}
      </Button>
    </form>
  );
}
