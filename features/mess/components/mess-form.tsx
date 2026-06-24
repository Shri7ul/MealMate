"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertMessAction } from "@/features/auth/actions";
import { messSchema, type MessValues } from "@/features/auth/schemas";

export function MessForm({ defaultName = "" }: { defaultName?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<MessValues>({
    resolver: zodResolver(messSchema),
    defaultValues: {
      name: defaultName
    }
  });

  function onSubmit(values: MessValues) {
    setMessage(null);
    startTransition(async () => {
      const result = await upsertMessAction(values);
      setMessage(result.message);
      if (result.success) {
        router.replace("/manager/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="mess-name">Mess name</Label>
        <Input id="mess-name" autoComplete="organization" {...register("name")} />
        {errors.name ? <p className="text-sm text-primary">{errors.name.message}</p> : null}
      </div>

      {message ? <p className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">{message}</p> : null}

      <Button type="submit" disabled={isPending}>
        <Save />
        {isPending ? "Saving" : "Save mess"}
      </Button>
    </form>
  );
}
