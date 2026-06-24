"use client";

import { useMemo, useState, useTransition } from "react";
import { Edit, Plus, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { DataTable, Pagination, TableCell, TableToolbar } from "@/components/common/table-shell";
import { deleteExpenseAction, upsertExpenseAction } from "@/features/mess/actions";
import { formatCurrency, formatDate, toDateInputValue } from "@/lib/utils";
import type { ExpenseWithCreator } from "@/services/mess/queries";
import type { ExpenseCategory } from "@/types/database";

const PAGE_SIZE = 10;
const categories: ExpenseCategory[] = [
  "bazaar",
  "gas",
  "electricity",
  "internet",
  "rent",
  "other"
];

function labelCategory(category: string) {
  return category
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function ExpenseDialog({
  expense,
  trigger
}: {
  expense?: ExpenseWithCreator;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(expense?.title ?? "");
  const [amount, setAmount] = useState(String(expense?.amount ?? ""));
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? "bazaar");
  const [expenseDate, setExpenseDate] = useState(expense?.expense_date ?? toDateInputValue());
  const [note, setNote] = useState(expense?.note ?? "");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await upsertExpenseAction({
        id: expense?.id,
        title,
        amount,
        category,
        expenseDate,
        note
      });
      showToast({
        title: result.success ? "Expense saved" : "Could not save expense",
        description: result.message,
        variant: result.success ? "success" : "error"
      });

      if (result.success) {
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{expense ? "Edit expense" : "Add expense"}</DialogTitle>
            <DialogDescription>Track mess costs by category, date, and receipt notes.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-5">
            <div className="space-y-2">
              <Label htmlFor={`expense-title-${expense?.id ?? "new"}`}>Title</Label>
              <Input
                id={`expense-title-${expense?.id ?? "new"}`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`expense-amount-${expense?.id ?? "new"}`}>Amount</Label>
                <Input
                  id={`expense-amount-${expense?.id ?? "new"}`}
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`expense-date-${expense?.id ?? "new"}`}>Expense date</Label>
                <Input
                  id={`expense-date-${expense?.id ?? "new"}`}
                  type="date"
                  value={expenseDate}
                  onChange={(event) => setExpenseDate(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`expense-category-${expense?.id ?? "new"}`}>Category</Label>
              <select
                id={`expense-category-${expense?.id ?? "new"}`}
                value={category}
                onChange={(event) => setCategory(event.target.value as ExpenseCategory)}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm capitalize"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {labelCategory(item)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`expense-note-${expense?.id ?? "new"}`}>Receipt notes</Label>
              <Input
                id={`expense-note-${expense?.id ?? "new"}`}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Receipt number, vendor, or short note"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving" : "Save expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ExpenseManagement({
  expenses,
  readOnly = false
}: {
  expenses: ExpenseWithCreator[];
  readOnly?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "all">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const totalExpenses = expenses.reduce((total, expense) => total + Number(expense.amount), 0);
  const todaysExpense = expenses
    .filter((expense) => expense.expense_date === toDateInputValue())
    .reduce((total, expense) => total + Number(expense.amount), 0);
  const filteredExpenses = useMemo(() => {
    const term = search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch =
        !term ||
        expense.title.toLowerCase().includes(term) ||
        expense.note?.toLowerCase().includes(term) ||
        expense.users?.name?.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
      const matchesDate = !dateFilter || expense.expense_date === dateFilter;

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [categoryFilter, dateFilter, expenses, search]);
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / PAGE_SIZE));
  const visibleExpenses = filteredExpenses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="size-5 text-primary" />
              Total expenses
            </CardTitle>
            <CardDescription>All mess costs recorded</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s expense</CardTitle>
            <CardDescription>{formatDate(toDateInputValue())}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency(todaysExpense)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bazaar</CardTitle>
            <CardDescription>Total bazaar spending</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {formatCurrency(
                expenses
                  .filter((expense) => expense.category === "bazaar")
                  .reduce((total, expense) => total + Number(expense.amount), 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <TableToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            resetPage();
          }}
          searchPlaceholder="Search expenses by title, note, or creator"
        >
          <Input
            type="date"
            value={dateFilter}
            onChange={(event) => {
              setDateFilter(event.target.value);
              resetPage();
            }}
            className="w-auto"
          />
          <select
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value as ExpenseCategory | "all");
              resetPage();
            }}
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm capitalize"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {labelCategory(item)}
              </option>
            ))}
          </select>
          {readOnly ? null : (
            <ExpenseDialog
              trigger={
                <Button type="button">
                  <Plus />
                  Add expense
                </Button>
              }
            />
          )}
        </TableToolbar>
        <DataTable
          columns={
            readOnly
              ? ["Date", "Title", "Category", "Amount", "Receipt Notes"]
              : ["Date", "Title", "Category", "Amount", "Receipt Notes", "Actions"]
          }
        >
          {visibleExpenses.length > 0 ? (
            visibleExpenses.map((expense) => (
              <tr key={expense.id}>
                <TableCell>{formatDate(expense.expense_date)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{expense.title}</p>
                    <p className="text-xs text-muted-foreground">{expense.users?.name ?? "Manager"}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="capitalize" variant="secondary">
                    {labelCategory(expense.category)}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(Number(expense.amount))}</TableCell>
                <TableCell className="max-w-64 truncate">{expense.note ?? "-"}</TableCell>
                {readOnly ? null : (
                  <TableCell>
                    <div className="flex gap-2">
                      <ExpenseDialog
                        expense={expense}
                        trigger={
                          <Button type="button" variant="ghost" size="sm">
                            <Edit />
                            Edit
                          </Button>
                        }
                      />
                      <ConfirmDeleteDialog
                        title="Delete expense"
                        description="This removes the selected expense record from Supabase."
                        action={() => deleteExpenseAction(expense.id)}
                      />
                    </div>
                  </TableCell>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <TableCell className="py-10 text-center text-muted-foreground" colSpan={readOnly ? 5 : 6}>
                No expense records found.
              </TableCell>
            </tr>
          )}
        </DataTable>
        <Pagination
          page={Math.min(page, totalPages)}
          totalPages={totalPages}
          totalItems={filteredExpenses.length}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
