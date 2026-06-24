import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import type { AppRole, Database } from "@/types/database";
import type { AuthSessionProfile } from "@/types/auth";

export type Mess = Database["public"]["Tables"]["messes"]["Row"];

export async function getSessionProfile(): Promise<AuthSessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return {
    profile,
    role: profile.role
  };
}

export async function requireSessionProfile(): Promise<AuthSessionProfile> {
  const sessionProfile = await getSessionProfile();

  if (!sessionProfile) {
    redirect("/login");
  }

  return sessionProfile;
}

export async function requireRole(role: AppRole): Promise<AuthSessionProfile> {
  const sessionProfile = await requireSessionProfile();

  if (sessionProfile.role !== role) {
    redirect(sessionProfile.role === "manager" ? "/manager/dashboard" : "/member/dashboard");
  }

  return sessionProfile;
}

export async function getManagerMess(managerId: string): Promise<Mess | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messes")
    .select("*")
    .eq("manager_id", managerId)
    .maybeSingle();

  return data ?? null;
}

export async function getMemberMess(userId: string): Promise<Mess | null> {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("members")
    .select("mess_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) {
    return null;
  }

  const { data: mess } = await supabase
    .from("messes")
    .select("*")
    .eq("id", membership.mess_id)
    .maybeSingle();

  return mess ?? null;
}
