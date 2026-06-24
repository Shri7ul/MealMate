"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarDays, Edit, Plus, Utensils } from "lucide-react";
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
import { deleteMealAction, upsertMealAction } from "@/features/mess/actions";
import { formatDate, toDateInputValue } from "@/lib/utils";
import type { MealWithMember, MemberWithUser } from "@/services/mess/queries";

const PAGE_SIZE = 10;

function memberName(memberId: string, members: MemberWithUser[]) {
  return members.find((member) => member.id === memberId)?.users?.name ?? "Unknown member";
}

function totalMeal(meal: Pick<MealWithMember, "breakfast" | "lunch" | "dinner">) {
  return Number(meal.breakfast) + Number(meal.lunch) + Number(meal.dinner);
}

function MealDialog({
  members,
  meal,
  trigger
}: {
  members: MemberWithUser[];
  meal?: MealWithMember;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState(meal?.member_id ?? members[0]?.id ?? "");
  const [date, setDate] = useState(meal?.date ?? toDateInputValue());
  const [breakfast, setBreakfast] = useState(String(meal?.breakfast ?? 0));
  const [lunch, setLunch] = useState(String(meal?.lunch ?? 0));
  const [dinner, setDinner] = useState(String(meal?.dinner ?? 0));
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function setQuickMeals(value: number) {
    setBreakfast(String(value));
    setLunch(String(value));
    setDinner(String(value));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await upsertMealAction({
        id: meal?.id,
        memberId,
        date,
        breakfast,
        lunch,
        dinner
      });
      showToast({
        title: result.success ? "Meal saved" : "Could not save meal",
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
            <DialogTitle>{meal ? "Edit meal" : "Add meal"}</DialogTitle>
            <DialogDescription>Record breakfast, lunch, and dinner for a member and date.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-5">
            <div className="space-y-2">
              <Label htmlFor={`meal-member-${meal?.id ?? "new"}`}>Member</Label>
              <select
                id={`meal-member-${meal?.id ?? "new"}`}
                value={memberId}
                onChange={(event) => setMemberId(event.target.value)}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.users?.name ?? member.users?.email ?? "Unknown member"}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`meal-date-${meal?.id ?? "new"}`}>Date</Label>
              <Input
                id={`meal-date-${meal?.id ?? "new"}`}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`breakfast-${meal?.id ?? "new"}`}>Breakfast</Label>
                <Input
                  id={`breakfast-${meal?.id ?? "new"}`}
                  type="number"
                  min="0"
                  step="0.5"
                  value={breakfast}
                  onChange={(event) => setBreakfast(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`lunch-${meal?.id ?? "new"}`}>Lunch</Label>
                <Input
                  id={`lunch-${meal?.id ?? "new"}`}
                  type="number"
                  min="0"
                  step="0.5"
                  value={lunch}
                  onChange={(event) => setLunch(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`dinner-${meal?.id ?? "new"}`}>Dinner</Label>
                <Input
                  id={`dinner-${meal?.id ?? "new"}`}
                  type="number"
                  min="0"
                  step="0.5"
                  value={dinner}
                  onChange={(event) => setDinner(event.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setQuickMeals(1)}>
                Full day
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setQuickMeals(0.5)}>
                Half meals
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setQuickMeals(0)}>
                Clear
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || members.length === 0}>
              {isPending ? "Saving" : "Save meal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MealManagement({
  members,
  meals,
  readOnly = false
}: {
  members: MemberWithUser[];
  meals: MealWithMember[];
  readOnly?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");
  const [page, setPage] = useState(1);
  const today = toDateInputValue();
  const todaysMeals = meals.filter((meal) => meal.date === today);
  const memberTotals = members.map((member) => ({
    member,
    total: meals
      .filter((meal) => meal.member_id === member.id)
      .reduce((total, meal) => total + totalMeal(meal), 0)
  }));
  const filteredMeals = useMemo(() => {
    const term = search.trim().toLowerCase();

    return meals.filter((meal) => {
      const name = meal.members?.users?.name ?? "";
      const email = meal.members?.users?.email ?? "";
      const matchesSearch =
        !term ||
        name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        meal.date.includes(term);
      const matchesDate = !dateFilter || meal.date === dateFilter;
      const matchesMember = memberFilter === "all" || meal.member_id === memberFilter;

      return matchesSearch && matchesDate && matchesMember;
    });
  }, [dateFilter, meals, memberFilter, search]);
  const totalPages = Math.max(1, Math.ceil(filteredMeals.length / PAGE_SIZE));
  const visibleMeals = filteredMeals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="size-5 text-primary" />
              Today&apos;s meals
            </CardTitle>
            <CardDescription>{formatDate(today)}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {todaysMeals.reduce((total, meal) => total + totalMeal(meal), 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Meal history</CardTitle>
            <CardDescription>Total saved meal entries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{meals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Member-wise meals</CardTitle>
            <CardDescription>Highest member total</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="truncate text-lg font-semibold">
              {memberTotals.sort((a, b) => b.total - a.total)[0]?.member.users?.name ?? "No members"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {memberTotals.sort((a, b) => b.total - a.total)[0]?.total ?? 0} meals
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
          searchPlaceholder="Search meals by member or date"
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
            value={memberFilter}
            onChange={(event) => {
              setMemberFilter(event.target.value);
              resetPage();
            }}
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="all">All members</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.users?.name ?? member.users?.email ?? "Unknown member"}
              </option>
            ))}
          </select>
          {readOnly ? null : (
            <MealDialog
              members={members}
              trigger={
                <Button type="button">
                  <Plus />
                  Add meal
                </Button>
              }
            />
          )}
        </TableToolbar>
        <DataTable
          columns={
            readOnly
              ? ["Date", "Member", "Breakfast", "Lunch", "Dinner", "Total"]
              : ["Date", "Member", "Breakfast", "Lunch", "Dinner", "Total", "Actions"]
          }
        >
          {visibleMeals.length > 0 ? (
            visibleMeals.map((meal) => (
              <tr key={meal.id}>
                <TableCell>{formatDate(meal.date)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{meal.members?.users?.name ?? memberName(meal.member_id, members)}</p>
                    <p className="text-xs text-muted-foreground">{meal.members?.users?.email}</p>
                  </div>
                </TableCell>
                <TableCell>{Number(meal.breakfast)}</TableCell>
                <TableCell>{Number(meal.lunch)}</TableCell>
                <TableCell>{Number(meal.dinner)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{totalMeal(meal)}</Badge>
                </TableCell>
                {readOnly ? null : (
                  <TableCell>
                    <div className="flex gap-2">
                      <MealDialog
                        members={members}
                        meal={meal}
                        trigger={
                          <Button type="button" variant="ghost" size="sm">
                            <Edit />
                            Edit
                          </Button>
                        }
                      />
                      <ConfirmDeleteDialog
                        title="Delete meal entry"
                        description="This removes the meal record for the selected member and date."
                        action={() => deleteMealAction(meal.id)}
                      />
                    </div>
                  </TableCell>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <TableCell className="py-10 text-center text-muted-foreground" colSpan={readOnly ? 6 : 7}>
                No meal entries found.
              </TableCell>
            </tr>
          )}
        </DataTable>
        <Pagination
          page={Math.min(page, totalPages)}
          totalPages={totalPages}
          totalItems={filteredMeals.length}
          onPageChange={setPage}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            Member-wise meal list
          </CardTitle>
          <CardDescription>Totals calculated from meal_entries.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {memberTotals.map(({ member, total }) => (
            <div key={member.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="truncate text-sm">{member.users?.name ?? "Unknown member"}</span>
              <Badge variant="outline">{total}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
