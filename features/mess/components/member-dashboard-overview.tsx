import { CreditCard, ReceiptText, Scale, TrendingUp, Utensils, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { PersonalBalanceSummary } from "@/services/mess/queries";

function balanceClass(value: number) {
  if (value > 0) {
    return "text-emerald-400";
  }

  if (value < 0) {
    return "text-red-400";
  }

  return "text-muted-foreground";
}

function balanceBadge(summary: PersonalBalanceSummary) {
  if (summary.balance < 0) {
    return {
      label: `Due: ${formatCurrency(Math.abs(summary.balance))}`,
      className: "border-red-500/40 bg-red-500/10 text-red-300"
    };
  }

  if (summary.balance > 0) {
    return {
      label: `Advance: ${formatCurrency(summary.balance)}`,
      className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
    };
  }

  return {
    label: "Settled",
    className: "border-border bg-secondary text-secondary-foreground"
  };
}

function SummaryCard({
  title,
  description,
  value,
  icon: Icon,
  className
}: {
  title: string;
  description: string;
  value: string | number;
  icon: typeof Utensils;
  className?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className={cn("text-3xl font-semibold", className)}>{value}</p>
      </CardContent>
    </Card>
  );
}

export function MemberDashboardOverview({ summary }: { summary: PersonalBalanceSummary }) {
  const badge = balanceBadge(summary);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="My Meals"
          description="Your breakfast, lunch, and dinner count"
          value={summary.totalMeals}
          icon={Utensils}
        />
        <SummaryCard
          title="Meal Rate"
          description="Total expense divided by meals"
          value={formatCurrency(summary.mealRate)}
          icon={TrendingUp}
        />
        <SummaryCard
          title="My Deposit"
          description="Your recorded deposits"
          value={formatCurrency(summary.totalDeposit)}
          icon={CreditCard}
        />
        <SummaryCard
          title="My Meal Cost"
          description="My meals x meal rate"
          value={formatCurrency(summary.mealCost)}
          icon={WalletCards}
        />
        <SummaryCard
          title="My Balance"
          description="My deposit minus meal cost"
          value={formatCurrency(summary.balance)}
          icon={Scale}
          className={balanceClass(summary.balance)}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Scale className="size-5 text-primary" />
              Personal Summary
            </CardTitle>
            <CardDescription>Your personal meal cost and balance calculation.</CardDescription>
          </div>
          <Badge variant="outline" className={badge.className}>
            {badge.label}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-medium">Meal Cost</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(summary.mealCost)}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {summary.totalMeals} meals x {formatCurrency(summary.mealRate)} meal rate
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-medium">Balance</p>
            <p className={cn("mt-2 text-2xl font-semibold", balanceClass(summary.balance))}>
              {formatCurrency(summary.balance)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatCurrency(summary.totalDeposit)} deposit - {formatCurrency(summary.mealCost)} meal cost
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 lg:col-span-2">
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <p className="text-muted-foreground">Meals</p>
                <p className="mt-1 font-medium">{summary.totalMeals}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Meal Rate</p>
                <p className="mt-1 font-medium">{formatCurrency(summary.mealRate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Deposit</p>
                <p className="mt-1 font-medium">{formatCurrency(summary.totalDeposit)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Meal Cost</p>
                <p className="mt-1 font-medium">{formatCurrency(summary.mealCost)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Balance</p>
                <p className={cn("mt-1 font-medium", balanceClass(summary.balance))}>
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="size-5 text-primary" />
              Recent meals
            </CardTitle>
            <CardDescription>Latest meal entries for your member record.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.recentMeals.length > 0 ? (
              <div className="space-y-3">
                {summary.recentMeals.map((meal) => (
                  <div key={meal.id} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span>{formatDate(meal.date)}</span>
                      <span className="font-medium">
                        {Number(meal.breakfast) + Number(meal.lunch) + Number(meal.dinner)} meals
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Breakfast {Number(meal.breakfast)} / Lunch {Number(meal.lunch)} / Dinner{" "}
                      {Number(meal.dinner)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No meal entries yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              Recent deposits
            </CardTitle>
            <CardDescription>Latest payments recorded for you.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.recentDeposits.length > 0 ? (
              <div className="space-y-3">
                {summary.recentDeposits.map((deposit) => (
                  <div key={deposit.id} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span>{formatDate(deposit.created_at)}</span>
                      <span className="font-medium">{formatCurrency(Number(deposit.amount))}</span>
                    </div>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {deposit.payment_method}
                      {deposit.note ? ` / ${deposit.note}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No deposits recorded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="size-5 text-primary" />
              Recent expenses
            </CardTitle>
            <CardDescription>Recent mess costs affecting meal rate.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.recentExpenses.length > 0 ? (
              <div className="space-y-3">
                {summary.recentExpenses.map((expense) => (
                  <div key={expense.id} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-medium">{expense.title}</span>
                      <span>{formatCurrency(Number(expense.amount))}</span>
                    </div>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {formatDate(expense.expense_date)} / {expense.category}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
