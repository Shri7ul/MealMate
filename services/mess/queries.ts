import { createClient } from "@/supabase/server";
import type { Database } from "@/types/database";

type MemberRow = Database["public"]["Tables"]["members"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];
type MessRow = Database["public"]["Tables"]["messes"]["Row"];
type MealRow = Database["public"]["Tables"]["meal_entries"]["Row"];
type DepositRow = Database["public"]["Tables"]["deposits"]["Row"];
type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
type ReportRow = Database["public"]["Tables"]["monthly_reports"]["Row"];

export interface MemberWithUser extends MemberRow {
  users: Pick<UserRow, "id" | "name" | "email" | "phone" | "avatar" | "role"> | null;
}

export interface RecordCountSummary {
  meals: number;
  deposits: number;
  expenses: number;
  reports: number;
}

export interface MemberFinancialSummary extends MemberWithUser {
  totalMeals: number;
  totalDeposits: number;
  balance: number;
  status: "settled" | "due" | "advance";
}

export interface MealWithMember extends MealRow {
  members: {
    id: string;
    users: Pick<UserRow, "name" | "email" | "phone" | "avatar"> | null;
  } | null;
}

export interface DepositWithMember extends DepositRow {
  members: {
    id: string;
    users: Pick<UserRow, "name" | "email" | "phone" | "avatar"> | null;
  } | null;
}

export interface ExpenseWithCreator extends ExpenseRow {
  users: Pick<UserRow, "name" | "email"> | null;
}

export interface MessTotals {
  totalMembers: number;
  totalMeals: number;
  totalDeposits: number;
  totalExpenses: number;
  mealRate: number;
  balance: number;
}

export interface DashboardData extends MessTotals {
  personalSummary: PersonalBalanceSummary | null;
  todaysMeals: number;
  todaysDeposit: number;
  todaysExpense: number;
  recentActivities: Array<{
    id: string;
    type: "meal" | "deposit" | "expense" | "member";
    title: string;
    description: string;
    date: string;
  }>;
  dailySeries: Array<{
    date: string;
    meals: number;
    expenses: number;
    deposits: number;
  }>;
}

export interface PersonalBalanceSummary {
  memberId: string | null;
  totalMeals: number;
  mealRate: number;
  totalDeposit: number;
  mealCost: number;
  balance: number;
  recentMeals: MealWithMember[];
  recentDeposits: DepositWithMember[];
  recentExpenses: ExpenseWithCreator[];
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

export async function getMessMemberSummaries(messId: string): Promise<MemberFinancialSummary[]> {
  const [members, meals, deposits, expenses] = await Promise.all([
    getMessMembers(messId),
    getMealEntriesForMess(messId),
    getDepositsForMess(messId),
    getExpensesForMess(messId)
  ]);

  const totalMeals = meals.reduce(
    (total, meal) => total + Number(meal.breakfast) + Number(meal.lunch) + Number(meal.dinner),
    0
  );
  const totalExpenses = expenses.reduce((total, expense) => total + Number(expense.amount), 0);
  const mealRate = totalMeals > 0 ? totalExpenses / totalMeals : 0;

  return members.map((member) => {
    const memberMeals = meals
      .filter((meal) => meal.member_id === member.id)
      .reduce(
        (total, meal) => total + Number(meal.breakfast) + Number(meal.lunch) + Number(meal.dinner),
        0
      );
    const memberDeposits = deposits
      .filter((deposit) => deposit.member_id === member.id)
      .reduce((total, deposit) => total + Number(deposit.amount), 0);
    const balance = memberDeposits - memberMeals * mealRate;

    return {
      ...member,
      totalMeals: memberMeals,
      totalDeposits: memberDeposits,
      balance,
      status: Math.abs(balance) < 1 ? "settled" : balance > 0 ? "advance" : "due"
    };
  });
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

export async function getNotifications(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data ?? [];
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

export async function getMealEntriesForMess(messId: string): Promise<MealWithMember[]> {
  const memberIds = await getMemberIdsForMess(messId);

  if (memberIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("meal_entries")
    .select("*, members(id, users(name, email, phone, avatar))")
    .in("member_id", memberIds)
    .order("date", { ascending: false });

  return (data ?? []) as MealWithMember[];
}

export async function getTodaysMealEntriesForMess(messId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const meals = await getMealEntriesForMess(messId);
  return meals.filter((meal) => meal.date === today);
}

export async function getDepositsForMess(messId: string): Promise<DepositWithMember[]> {
  const memberIds = await getMemberIdsForMess(messId);

  if (memberIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("deposits")
    .select("*, members(id, users(name, email, phone, avatar))")
    .in("member_id", memberIds)
    .order("created_at", { ascending: false });

  return (data ?? []) as DepositWithMember[];
}

export async function getExpensesForMess(messId: string): Promise<ExpenseWithCreator[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("*, users(name, email)")
    .eq("mess_id", messId)
    .order("expense_date", { ascending: false });

  return (data ?? []) as ExpenseWithCreator[];
}

export async function getReportsForMess(messId: string): Promise<ReportRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("monthly_reports")
    .select("*")
    .eq("mess_id", messId)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  return data ?? [];
}

export function calculateMessTotals({
  members,
  meals,
  deposits,
  expenses
}: {
  members: MemberWithUser[];
  meals: MealRow[];
  deposits: DepositRow[];
  expenses: ExpenseRow[];
}): MessTotals {
  const totalMeals = meals.reduce(
    (total, meal) => total + Number(meal.breakfast) + Number(meal.lunch) + Number(meal.dinner),
    0
  );
  const totalDeposits = deposits.reduce((total, deposit) => total + Number(deposit.amount), 0);
  const totalExpenses = expenses.reduce((total, expense) => total + Number(expense.amount), 0);
  const mealRate = totalMeals > 0 ? totalExpenses / totalMeals : 0;

  return {
    totalMembers: members.length,
    totalMeals,
    totalDeposits,
    totalExpenses,
    mealRate,
    balance: totalDeposits - totalExpenses
  };
}

export async function getMessTotals(messId: string): Promise<MessTotals> {
  const [members, meals, deposits, expenses] = await Promise.all([
    getMessMembers(messId),
    getMealEntriesForMess(messId),
    getDepositsForMess(messId),
    getExpensesForMess(messId)
  ]);

  return calculateMessTotals({ members, meals, deposits, expenses });
}

export async function getPersonalBalanceSummary(
  messId: string,
  userId: string
): Promise<PersonalBalanceSummary | null> {
  const [members, meals, deposits, expenses] = await Promise.all([
    getMessMembers(messId),
    getMealEntriesForMess(messId),
    getDepositsForMess(messId),
    getExpensesForMess(messId)
  ]);
  const totals = calculateMessTotals({ members, meals, deposits, expenses });
  const member = members.find((item) => item.user_id === userId);

  if (!member) {
    return null;
  }

  const memberMeals = meals.filter((meal) => meal.member_id === member.id);
  const memberDeposits = deposits.filter((deposit) => deposit.member_id === member.id);
  const totalMeals = memberMeals.reduce(
    (total, meal) => total + Number(meal.breakfast) + Number(meal.lunch) + Number(meal.dinner),
    0
  );
  const totalDeposit = memberDeposits.reduce((total, deposit) => total + Number(deposit.amount), 0);
  const mealCost = totalMeals * totals.mealRate;

  return {
    memberId: member.id,
    totalMeals,
    mealRate: totals.mealRate,
    totalDeposit,
    mealCost,
    balance: totalDeposit - mealCost,
    recentMeals: memberMeals.slice(0, 5),
    recentDeposits: memberDeposits.slice(0, 5),
    recentExpenses: expenses.slice(0, 5)
  };
}

function isSameDay(value: string, date: string) {
  return value.slice(0, 10) === date;
}

function getDateRange(days: number) {
  const dates: string[] = [];
  const today = new Date();

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    dates.push(date.toISOString().slice(0, 10));
  }

  return dates;
}

export async function getDashboardData(messId: string, userId: string): Promise<DashboardData> {
  const [members, meals, deposits, expenses] = await Promise.all([
    getMessMembers(messId),
    getMealEntriesForMess(messId),
    getDepositsForMess(messId),
    getExpensesForMess(messId)
  ]);
  const totals = calculateMessTotals({ members, meals, deposits, expenses });
  const member = members.find((item) => item.user_id === userId);
  const memberMeals = member ? meals.filter((meal) => meal.member_id === member.id) : [];
  const memberDeposits = member ? deposits.filter((deposit) => deposit.member_id === member.id) : [];
  const personalTotalMeals = memberMeals.reduce(
    (total, meal) => total + Number(meal.breakfast) + Number(meal.lunch) + Number(meal.dinner),
    0
  );
  const personalTotalDeposit = memberDeposits.reduce(
    (total, deposit) => total + Number(deposit.amount),
    0
  );
  const personalMealCost = personalTotalMeals * totals.mealRate;
  const today = new Date().toISOString().slice(0, 10);

  const dailySeries = getDateRange(7).map((date) => ({
    date,
    meals: meals
      .filter((meal) => meal.date === date)
      .reduce(
        (total, meal) => total + Number(meal.breakfast) + Number(meal.lunch) + Number(meal.dinner),
        0
      ),
    expenses: expenses
      .filter((expense) => expense.expense_date === date)
      .reduce((total, expense) => total + Number(expense.amount), 0),
    deposits: deposits
      .filter((deposit) => isSameDay(deposit.created_at, date))
      .reduce((total, deposit) => total + Number(deposit.amount), 0)
  }));

  const recentActivities = [
    ...meals.slice(0, 5).map((meal) => ({
      id: meal.id,
      type: "meal" as const,
      title: meal.members?.users?.name ?? "Meal entry",
      description: `${Number(meal.breakfast) + Number(meal.lunch) + Number(meal.dinner)} meals recorded`,
      date: meal.date
    })),
    ...deposits.slice(0, 5).map((deposit) => ({
      id: deposit.id,
      type: "deposit" as const,
      title: deposit.members?.users?.name ?? "Deposit",
      description: `${deposit.payment_method} deposit of ${Number(deposit.amount)}`,
      date: deposit.created_at
    })),
    ...expenses.slice(0, 5).map((expense) => ({
      id: expense.id,
      type: "expense" as const,
      title: expense.title,
      description: `${expense.category} expense of ${Number(expense.amount)}`,
      date: expense.expense_date
    })),
    ...members.slice(0, 5).map((member) => ({
      id: member.id,
      type: "member" as const,
      title: member.users?.name ?? "Member",
      description: "Joined the mess",
      date: member.joined_at
    }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return {
    ...totals,
    personalSummary: member
      ? {
          memberId: member.id,
          totalMeals: personalTotalMeals,
          mealRate: totals.mealRate,
          totalDeposit: personalTotalDeposit,
          mealCost: personalMealCost,
          balance: personalTotalDeposit - personalMealCost,
          recentMeals: memberMeals.slice(0, 5),
          recentDeposits: memberDeposits.slice(0, 5),
          recentExpenses: expenses.slice(0, 5)
        }
      : null,
    todaysMeals: dailySeries[dailySeries.length - 1]?.meals ?? 0,
    todaysDeposit: deposits
      .filter((deposit) => isSameDay(deposit.created_at, today))
      .reduce((total, deposit) => total + Number(deposit.amount), 0),
    todaysExpense: expenses
      .filter((expense) => expense.expense_date === today)
      .reduce((total, expense) => total + Number(expense.amount), 0),
    recentActivities,
    dailySeries
  };
}

export async function getMonthlyReportData(messId: string, month: number, year: number) {
  const [members, meals, deposits, expenses] = await Promise.all([
    getMessMembers(messId),
    getMealEntriesForMess(messId),
    getDepositsForMess(messId),
    getExpensesForMess(messId)
  ]);

  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const monthlyMeals = meals.filter((meal) => meal.date.startsWith(prefix));
  const monthlyDeposits = deposits.filter((deposit) => deposit.created_at.startsWith(prefix));
  const monthlyExpenses = expenses.filter((expense) => expense.expense_date.startsWith(prefix));
  const totals = calculateMessTotals({
    members,
    meals: monthlyMeals,
    deposits: monthlyDeposits,
    expenses: monthlyExpenses
  });

  const memberBalances = members.map((member) => {
    const memberMeals = monthlyMeals
      .filter((meal) => meal.member_id === member.id)
      .reduce(
        (total, meal) => total + Number(meal.breakfast) + Number(meal.lunch) + Number(meal.dinner),
        0
      );
    const memberDeposits = monthlyDeposits
      .filter((deposit) => deposit.member_id === member.id)
      .reduce((total, deposit) => total + Number(deposit.amount), 0);

    return {
      member,
      meals: memberMeals,
      deposits: memberDeposits,
      balance: memberDeposits - memberMeals * totals.mealRate
    };
  });

  return {
    ...totals,
    memberBalances,
    expenses: monthlyExpenses,
    deposits: monthlyDeposits
  };
}
