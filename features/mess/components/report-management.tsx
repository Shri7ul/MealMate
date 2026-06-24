"use client";

import { useMemo, useState, useTransition } from "react";
import { ChartNoAxesCombined, FilePlus2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { DataTable, Pagination, TableCell, TableToolbar } from "@/components/common/table-shell";
import { generateReportAction } from "@/features/mess/actions";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/types/database";

type ReportRow = Database["public"]["Tables"]["monthly_reports"]["Row"];

interface MemberBalance {
  name: string;
  meals: number;
  deposits: number;
  balance: number;
}

interface MonthlySummary {
  month: number;
  year: number;
  totalMembers: number;
  totalMeals: number;
  totalDeposits: number;
  totalExpenses: number;
  mealRate: number;
  balance: number;
  memberBalances: MemberBalance[];
}

const PAGE_SIZE = 10;
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export function ReportManagement({
  summary,
  reports
}: {
  summary: MonthlySummary;
  reports: ReportRow[];
}) {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const availableYears = Array.from(new Set(reports.map((report) => String(report.year)))).sort((a, b) =>
    b.localeCompare(a)
  );
  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reports.filter((report) => {
      const period = `${monthNames[report.month - 1]} ${report.year}`.toLowerCase();
      const matchesSearch = !term || period.includes(term);
      const matchesYear = yearFilter === "all" || String(report.year) === yearFilter;

      return matchesSearch && matchesYear;
    });
  }, [reports, search, yearFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const visibleReports = filteredReports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function onGenerate() {
    startTransition(async () => {
      const result = await generateReportAction({
        month: summary.month,
        year: summary.year,
        totalMeal: summary.totalMeals,
        mealRate: summary.mealRate,
        totalExpense: summary.totalExpenses
      });
      showToast({
        title: result.success ? "Report generated" : "Could not generate report",
        description: result.message,
        variant: result.success ? "success" : "error"
      });
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Active in period</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{summary.totalMembers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Meals</CardTitle>
            <CardDescription>Monthly meal count</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{summary.totalMeals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deposits</CardTitle>
            <CardDescription>Member payments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency(summary.totalDeposits)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Monthly costs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency(summary.totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Meal Rate</CardTitle>
            <CardDescription>Expense per meal</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency(summary.mealRate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
            <CardDescription>Deposit minus expense</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency(summary.balance)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ChartNoAxesCombined className="size-5 text-primary" />
              Monthly Summary
            </CardTitle>
            <CardDescription>
              {monthNames[summary.month - 1]} {summary.year} calculated from Supabase records.
            </CardDescription>
          </div>
          <Button type="button" onClick={onGenerate} disabled={isPending}>
            <FilePlus2 />
            {isPending ? "Generating" : "Generate report"}
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={["Member", "Meals", "Deposits", "Balance", "Status"]}>
            {summary.memberBalances.length > 0 ? (
              summary.memberBalances.map((member) => (
                <tr key={member.name}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.meals}</TableCell>
                  <TableCell>{formatCurrency(member.deposits)}</TableCell>
                  <TableCell>{formatCurrency(member.balance)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        Math.abs(member.balance) < 1
                          ? "default"
                          : member.balance > 0
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {Math.abs(member.balance) < 1 ? "Settled" : member.balance > 0 ? "Advance" : "Due"}
                    </Badge>
                  </TableCell>
                </tr>
              ))
            ) : (
              <tr>
                <TableCell className="py-10 text-center text-muted-foreground" colSpan={5}>
                  No member balance rows for this month.
                </TableCell>
              </tr>
            )}
          </DataTable>
        </CardContent>
      </Card>

      <Card>
        <TableToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search generated reports"
        >
          <select
            value={yearFilter}
            onChange={(event) => {
              setYearFilter(event.target.value);
              setPage(1);
            }}
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="all">All years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </TableToolbar>
        <DataTable columns={["Period", "Total Meals", "Total Expense", "Meal Rate"]}>
          {visibleReports.length > 0 ? (
            visibleReports.map((report) => (
              <tr key={report.id}>
                <TableCell className="font-medium">
                  {monthNames[report.month - 1]} {report.year}
                </TableCell>
                <TableCell>{Number(report.total_meal)}</TableCell>
                <TableCell>{formatCurrency(Number(report.total_expense))}</TableCell>
                <TableCell>{formatCurrency(Number(report.meal_rate))}</TableCell>
              </tr>
            ))
          ) : (
            <tr>
              <TableCell className="py-10 text-center text-muted-foreground" colSpan={4}>
                No generated reports found.
              </TableCell>
            </tr>
          )}
        </DataTable>
        <Pagination
          page={Math.min(page, totalPages)}
          totalPages={totalPages}
          totalItems={filteredReports.length}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
