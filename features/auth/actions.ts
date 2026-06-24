"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { messSchema, profileSchema, type MessValues, type ProfileValues } from "@/features/auth/schemas";
import { requireRole, requireSessionProfile } from "@/services/auth/get-session-profile";

export interface ActionResult {
  success: boolean;
  message: string;
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateProfileAction(values: ProfileValues): Promise<ActionResult> {
  const sessionProfile = await requireSessionProfile();
  const parsed = profileSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid profile details."
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      avatar: parsed.data.avatar || null
    })
    .eq("id", sessionProfile.profile.id);

  if (error) {
    return {
      success: false,
      message: error.message
    };
  }

  revalidatePath("/profile");
  revalidatePath("/settings");

  return {
    success: true,
    message: "Profile updated."
  };
}

export async function upsertMessAction(values: MessValues): Promise<ActionResult> {
  const sessionProfile = await requireRole("manager");
  const parsed = messSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid mess details."
    };
  }

  const supabase = await createClient();
  const { data: existingMess, error: readError } = await supabase
    .from("messes")
    .select("id")
    .eq("manager_id", sessionProfile.profile.id)
    .maybeSingle();

  if (readError) {
    return {
      success: false,
      message: readError.message
    };
  }

  const query = existingMess
    ? supabase.from("messes").update({ name: parsed.data.name }).eq("id", existingMess.id)
    : supabase.from("messes").insert({
        name: parsed.data.name,
        manager_id: sessionProfile.profile.id
      });

  const { error } = await query;

  if (error) {
    return {
      success: false,
      message: error.message
    };
  }

  revalidatePath("/manager/dashboard");
  revalidatePath("/settings");
  revalidatePath("/onboarding");

  return {
    success: true,
    message: existingMess ? "Mess updated." : "Mess created."
  };
}
