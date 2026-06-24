"use client";

import { Activity, CreditCard, ReceiptText, Scale, TrendingUp, UserRound, Users, Utensils } from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { DashboardData } from "@/services/mess/queries";

function StatCard({
  title,
  description,
  value,
  icon: Icon,
  href,
  action
}: {
  title: string;
  description: string;
  value: string | number;
  icon: typeof Users;
  href?: string;
  action?: string;
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
        <p className="text-3xl font-semibold">{value}</p>
        {href && action ? (
          <Button asChild variant="outline" className="mt-4">
            <Link href={href}>{action}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function balanceClass(value: number) {
  if (value > 0) {
    return "text-emerald-400";
  }

  if (value < 0) {
    return "text-red-400";
  }

  return "text-muted-foreground";
}

export function DashboardOverview({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Members"
          description="Active mess members"
          value={data.totalMembers}
          icon={Users}
          href="/manager/members"
          action="Open members"
        />
        <StatCard
          title="Today's Meals"
          description="Breakfast, lunch, and dinner count"
          value={data.todaysMeals}
          icon={Utensils}
          href="/manager/meals"
          action="Open meals"
        />
        <StatCard
          title="Meal Rate"
          description="Expense divided by total meals"
          value={formatCurrency(data.mealRate)}
          icon={TrendingUp}
        />
        <StatCard
          title="Today's Expense"
          description="Expenses recorded today"
          value={formatCurrency(data.todaysExpense)}
          icon={ReceiptText}
          href="/manager/expenses"
          action="Open expenses"
        />
        <StatCard
          title="Today's Deposit"
          description="Deposits recorded today"
          value={formatCurrency(data.todaysDeposit)}
          icon={CreditCard}
          href="/manager/deposits"
          action="Open deposits"
        />
        <StatCard
          title="Balance"
          description="Total deposits minus expenses"
          value={formatCurrency(data.balance)}
          icon={Scale}
          href="/manager/reports"
          action="Open reports"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5 text-primary" />
            Manager Personal Summary
          </CardTitle>
          <CardDescription>Your own meals, deposits, meal cost, and balance as a mess member.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.personalSummary ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">My Meals</p>
                <p className="mt-2 text-2xl font-semibold">{data.personalSummary.totalMeals}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">My Deposit</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(data.personalSummary.totalDeposit)}
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">My Meal Cost</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(data.personalSummary.mealCost)}
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">My Balance</p>
                <p className={cn("mt-2 text-2xl font-semibold", balanceClass(data.personalSummary.balance))}>
                  {formatCurrency(data.personalSummary.balance)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your manager account is not linked to a member record yet.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Last 7 days</CardTitle>
            <CardDescription>Meals, expenses, and deposits from Supabase records.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => value.slice(5)}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="meals" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deposits" fill="hsl(var(--secondary-foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5 text-primary" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest member, meal, deposit, and expense records.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivities.map((activity) => (
                  <div key={`${activity.type}-${activity.id}`} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{activity.title}</p>
                        <p className="mt-1 text-xs capitalize text-muted-foreground">
                          {activity.type} - {activity.description}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(activity.date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No activity has been recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
