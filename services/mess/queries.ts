import { createClient } from "@/supabase/server";
import type { Database } from "@/types/database";

type MemberRow = Database["public"]["Tables"]["members"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];
type MessRow = Database["public"]["Tables"]["messes"]["Row"];

export interface MemberWithUser extends MemberRow {
  users: Pick<UserRow, "id" | "name" | "email" | "phone" | "avatar" | "role"> | null;
}

export interface RecordCountSummary {
  meals: number;
  deposits: number;
  expenses: number;
  reports: number;
}

export async function getAccessibleMessId(userId: string, role: "manager" | "member") {
  const supabase = await createClient();

  if (role === "manager") {
    const { data } = await supabase.from("messes").select("id").eq("manager_id", userId).maybeSingle();
    return data?.id ?? null;
  }

  const { data } = await supabase.from("members").select("mess_id").eq("user_id", userId).maybeSingle();
  return data?.mess_id ?? null;
}

export async function getAccessibleMess(userId: string, role: "manager" | "member"): Promise<MessRow | null> {
  const supabase = await createClient();

  if (role === "manager") {
    const { data } = await supabase.from("messes").select("*").eq("manager_id", userId).maybeSingle();
    return data ?? null;
  }

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

export async function getMessMembers(messId: string): Promise<MemberWithUser[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("*, users(id, name, email, phone, avatar, role)")
    .eq("mess_id", messId)
    .order("joined_at", { ascending: false });

  return (data ?? []) as MemberWithUser[];
}

export async function countUnreadNotifications(userId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return count ?? 0;
}

async function getMemberIdsForMess(messId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("members").select("id").eq("mess_id", messId);
  return (data ?? []).map((member) => member.id);
}

export async function countMealsForMess(messId: string) {
  const memberIds = await getMemberIdsForMess(messId);

  if (memberIds.length === 0) {
    return 0;
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("meal_entries")
    .select("id", { count: "exact", head: true })
    .in("member_id", memberIds);

  return count ?? 0;
}

export async function countDepositsForMess(messId: string) {
  const memberIds = await getMemberIdsForMess(messId);

  if (memberIds.length === 0) {
    return 0;
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("deposits")
    .select("id", { count: "exact", head: true })
    .in("member_id", memberIds);

  return count ?? 0;
}

export async function countExpensesForMess(messId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .eq("mess_id", messId);

  return count ?? 0;
}

export async function countReportsForMess(messId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("monthly_reports")
    .select("id", { count: "exact", head: true })
    .eq("mess_id", messId);

  return count ?? 0;
}

export async function getRecordCountSummary(messId: string): Promise<RecordCountSummary> {
  const [meals, deposits, expenses, reports] = await Promise.all([
    countMealsForMess(messId),
    countDepositsForMess(messId),
    countExpensesForMess(messId),
    countReportsForMess(messId)
  ]);

  return {
    meals,
    deposits,
    expenses,
    reports
  };
}
