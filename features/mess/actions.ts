"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import { requireRole } from "@/services/auth/get-session-profile";
import type { ActionResult } from "@/features/auth/actions";
import type { ExpenseCategory, PaymentMethod } from "@/types/database";

const memberAddSchema = z.object({
  email: z.string().email("Enter a valid member email.")
});

const memberUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().optional(),
  avatar: z.string().url("Enter a valid avatar URL.").or(z.literal("")).optional()
});

const mealSchema = z.object({
  id: z.string().uuid().optional(),
  memberId: z.string().uuid("Select a member."),
  date: z.string().min(1, "Select a date."),
  breakfast: z.coerce.number().min(0),
  lunch: z.coerce.number().min(0),
  dinner: z.coerce.number().min(0)
});

const depositSchema = z.object({
  id: z.string().uuid().optional(),
  memberId: z.string().uuid("Select a member."),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  paymentMethod: z.enum(["cash", "bkash", "nagad", "bank", "other"]),
  note: z.string().optional()
});

const expenseSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2, "Title must be at least 2 characters."),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  category: z.enum(["bazaar", "gas", "electricity", "internet", "rent", "utilities", "other"]),
  expenseDate: z.string().min(1, "Select an expense date."),
  note: z.string().optional()
});

const reportSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  totalMeal: z.coerce.number().min(0),
  mealRate: z.coerce.number().min(0),
  totalExpense: z.coerce.number().min(0)
});

function success(message: string): ActionResult {
  return { success: true, message };
}

function failure(message: string): ActionResult {
  return { success: false, message };
}

function revalidateMessPaths() {
  [
    "/manager/dashboard",
    "/manager/members",
    "/manager/meals",
    "/manager/deposits",
    "/manager/expenses",
    "/manager/reports",
    "/members",
    "/meals",
    "/deposits",
    "/expenses",
    "/reports"
  ].forEach((path) => revalidatePath(path));
}

async function getManagerMessId() {
  const { profile } = await requireRole("manager");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messes")
    .select("id")
    .eq("manager_id", profile.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Create a mess before managing records.");
  }

  return { messId: data.id, managerId: profile.id, supabase };
}

export async function addMemberAction(values: unknown): Promise<ActionResult> {
  const parsed = memberAddSchema.safeParse(values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid member details.");
  }

  try {
    const { messId, supabase } = await getManagerMessId();
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", parsed.data.email.trim().toLowerCase())
      .maybeSingle();

    if (userError) {
      return failure(userError.message);
    }

    if (!user) {
      return failure("No registered account found for this email.");
    }

    const { error } = await supabase.from("members").insert({
      mess_id: messId,
      user_id: user.id
    });

    if (error) {
      if (error.code === "23505") {
        return failure("This user is already assigned to a mess.");
      }

      return failure(error.message);
    }

    revalidateMessPaths();
    return success("Member added.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not add member.");
  }
}

export async function updateMemberAction(values: unknown): Promise<ActionResult> {
  const parsed = memberUpdateSchema.safeParse(values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid member details.");
  }

  try {
    const { supabase } = await getManagerMessId();
    const { data: membership, error: memberError } = await supabase
      .from("members")
      .select("user_id")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (memberError) {
      return failure(memberError.message);
    }

    if (!membership) {
      return failure("Member record was not found.");
    }

    const { error } = await supabase
      .from("users")
      .update({
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        avatar: parsed.data.avatar || null
      })
      .eq("id", membership.user_id);

    if (error) {
      return failure(error.message);
    }

    revalidateMessPaths();
    return success("Member updated.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not update member.");
  }
}

export async function deleteMemberAction(memberId: string): Promise<ActionResult> {
  try {
    const { managerId, supabase } = await getManagerMessId();
    const { data: membership, error: memberError } = await supabase
      .from("members")
      .select("user_id")
      .eq("id", memberId)
      .maybeSingle();

    if (memberError) {
      return failure(memberError.message);
    }

    if (!membership) {
      return failure("Member record was not found.");
    }

    if (membership.user_id === managerId) {
      return failure("The manager membership cannot be removed.");
    }

    const { error } = await supabase.from("members").delete().eq("id", memberId);

    if (error) {
      return failure(error.message);
    }

    revalidateMessPaths();
    return success("Member deleted.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not delete member.");
  }
}

export async function upsertMealAction(values: unknown): Promise<ActionResult> {
  const parsed = mealSchema.safeParse(values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid meal details.");
  }

  try {
    const { supabase } = await getManagerMessId();
    const payload = {
      member_id: parsed.data.memberId,
      date: parsed.data.date,
      breakfast: parsed.data.breakfast,
      lunch: parsed.data.lunch,
      dinner: parsed.data.dinner
    };
    const query = parsed.data.id
      ? supabase.from("meal_entries").update(payload).eq("id", parsed.data.id)
      : supabase.from("meal_entries").upsert(payload, {
          onConflict: "member_id,date"
        });
    const { error } = await query;

    if (error) {
      return failure(error.message);
    }

    revalidateMessPaths();
    return success(parsed.data.id ? "Meal updated." : "Meal saved.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not save meal.");
  }
}

export async function deleteMealAction(mealId: string): Promise<ActionResult> {
  try {
    const { supabase } = await getManagerMessId();
    const { error } = await supabase.from("meal_entries").delete().eq("id", mealId);

    if (error) {
      return failure(error.message);
    }

    revalidateMessPaths();
    return success("Meal deleted.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not delete meal.");
  }
}

export async function upsertDepositAction(values: unknown): Promise<ActionResult> {
  const parsed = depositSchema.safeParse(values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid deposit details.");
  }

  try {
    const { supabase } = await getManagerMessId();
    const payload = {
      member_id: parsed.data.memberId,
      amount: parsed.data.amount,
      payment_method: parsed.data.paymentMethod as PaymentMethod,
      note: parsed.data.note || null
    };
    const query = parsed.data.id
      ? supabase.from("deposits").update(payload).eq("id", parsed.data.id)
      : supabase.from("deposits").insert(payload);
    const { error } = await query;

    if (error) {
      return failure(error.message);
    }

    revalidateMessPaths();
    return success(parsed.data.id ? "Deposit updated." : "Deposit added.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not save deposit.");
  }
}

export async function deleteDepositAction(depositId: string): Promise<ActionResult> {
  try {
    const { supabase } = await getManagerMessId();
    const { error } = await supabase.from("deposits").delete().eq("id", depositId);

    if (error) {
      return failure(error.message);
    }

    revalidateMessPaths();
    return success("Deposit deleted.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not delete deposit.");
  }
}

export async function upsertExpenseAction(values: unknown): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse(values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid expense details.");
  }

  try {
    const { messId, managerId, supabase } = await getManagerMessId();
    const payload = {
      mess_id: messId,
      category: parsed.data.category as ExpenseCategory,
      title: parsed.data.title,
      amount: parsed.data.amount,
      created_by: managerId,
      expense_date: parsed.data.expenseDate,
      note: parsed.data.note || null
    };
    const query = parsed.data.id
      ? supabase.from("expenses").update(payload).eq("id", parsed.data.id)
      : supabase.from("expenses").insert(payload);
    const { error } = await query;

    if (error) {
      return failure(error.message);
    }

    revalidateMessPaths();
    return success(parsed.data.id ? "Expense updated." : "Expense added.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not save expense.");
  }
}

export async function deleteExpenseAction(expenseId: string): Promise<ActionResult> {
  try {
    const { supabase } = await getManagerMessId();
    const { error } = await supabase.from("expenses").delete().eq("id", expenseId);

    if (error) {
      return failure(error.message);
    }

    revalidateMessPaths();
    return success("Expense deleted.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not delete expense.");
  }
}

export async function generateReportAction(values: unknown): Promise<ActionResult> {
  const parsed = reportSchema.safeParse(values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid report details.");
  }

  try {
    const { messId, supabase } = await getManagerMessId();
    const { error } = await supabase.from("monthly_reports").upsert(
      {
        mess_id: messId,
        month: parsed.data.month,
        year: parsed.data.year,
        total_meal: parsed.data.totalMeal,
        meal_rate: parsed.data.mealRate,
        total_expense: parsed.data.totalExpense
      },
      { onConflict: "mess_id,month,year" }
    );

    if (error) {
      return failure(error.message);
    }

    revalidateMessPaths();
    return success("Report generated.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not generate report.");
  }
}
