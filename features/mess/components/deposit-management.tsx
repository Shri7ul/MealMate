"use client";

import { useMemo, useState, useTransition } from "react";
import { CreditCard, Edit, Plus } from "lucide-react";
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
import { deleteDepositAction, upsertDepositAction } from "@/features/mess/actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DepositWithMember, MemberWithUser } from "@/services/mess/queries";
import type { PaymentMethod } from "@/types/database";

const PAGE_SIZE = 10;
const paymentMethods: PaymentMethod[] = ["cash", "bkash", "nagad", "bank", "other"];

function DepositDialog({
  members,
  deposit,
  trigger
}: {
  members: MemberWithUser[];
  deposit?: DepositWithMember;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState(deposit?.member_id ?? members[0]?.id ?? "");
  const [amount, setAmount] = useState(String(deposit?.amount ?? ""));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(deposit?.payment_method ?? "cash");
  const [note, setNote] = useState(deposit?.note ?? "");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await upsertDepositAction({
        id: deposit?.id,
        memberId,
        amount,
        paymentMethod,
        note
      });
      showToast({
        title: result.success ? "Deposit saved" : "Could not save deposit",
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
            <DialogTitle>{deposit ? "Edit deposit" : "Add deposit"}</DialogTitle>
            <DialogDescription>Record member payment details and optional notes.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-5">
            <div className="space-y-2">
              <Label htmlFor={`deposit-member-${deposit?.id ?? "new"}`}>Member</Label>
              <select
                id={`deposit-member-${deposit?.id ?? "new"}`}
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
              <Label htmlFor={`deposit-amount-${deposit?.id ?? "new"}`}>Amount</Label>
              <Input
                id={`deposit-amount-${deposit?.id ?? "new"}`}
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`deposit-method-${deposit?.id ?? "new"}`}>Payment method</Label>
              <select
                id={`deposit-method-${deposit?.id ?? "new"}`}
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm capitalize"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`deposit-note-${deposit?.id ?? "new"}`}>Notes</Label>
              <Input
                id={`deposit-note-${deposit?.id ?? "new"}`}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Receipt number, sender number, or reference"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || members.length === 0}>
              {isPending ? "Saving" : "Save deposit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DepositManagement({
  members,
  deposits,
  readOnly = false
}: {
  members: MemberWithUser[];
  deposits: DepositWithMember[];
  readOnly?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [page, setPage] = useState(1);
  const totalDeposits = deposits.reduce((total, deposit) => total + Number(deposit.amount), 0);
  const filteredDeposits = useMemo(() => {
    const term = search.trim().toLowerCase();

    return deposits.filter((deposit) => {
      const name = deposit.members?.users?.name ?? "";
      const email = deposit.members?.users?.email ?? "";
      const matchesSearch =
        !term ||
        name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        deposit.note?.toLowerCase().includes(term);
      const matchesMethod = methodFilter === "all" || deposit.payment_method === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [deposits, methodFilter, search]);
  const totalPages = Math.max(1, Math.ceil(filteredDeposits.length / PAGE_SIZE));
  const visibleDeposits = filteredDeposits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              Total deposits
            </CardTitle>
            <CardDescription>All recorded member payments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency(totalDeposits)}</p>
          </CardContent>
        </Card>
        {paymentMethods.slice(0, 2).map((method) => (
          <Card key={method}>
            <CardHeader>
              <CardTitle className="capitalize">{method}</CardTitle>
              <CardDescription>Deposit total by payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {formatCurrency(
                  deposits
                    .filter((deposit) => deposit.payment_method === method)
                    .reduce((total, deposit) => total + Number(deposit.amount), 0)
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <TableToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            resetPage();
          }}
          searchPlaceholder="Search deposits by member or notes"
        >
          <select
            value={methodFilter}
            onChange={(event) => {
              setMethodFilter(event.target.value as PaymentMethod | "all");
              resetPage();
            }}
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm capitalize"
          >
            <option value="all">All methods</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          {readOnly ? null : (
            <DepositDialog
              members={members}
              trigger={
                <Button type="button">
                  <Plus />
                  Add deposit
                </Button>
              }
            />
          )}
        </TableToolbar>
        <DataTable
          columns={
            readOnly
              ? ["Date", "Member", "Amount", "Method", "Notes"]
              : ["Date", "Member", "Amount", "Method", "Notes", "Actions"]
          }
        >
          {visibleDeposits.length > 0 ? (
            visibleDeposits.map((deposit) => (
              <tr key={deposit.id}>
                <TableCell>{formatDate(deposit.created_at)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{deposit.members?.users?.name ?? "Unknown member"}</p>
                    <p className="text-xs text-muted-foreground">{deposit.members?.users?.email}</p>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(Number(deposit.amount))}</TableCell>
                <TableCell>
                  <Badge className="capitalize" variant="secondary">
                    {deposit.payment_method}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-64 truncate">{deposit.note ?? "-"}</TableCell>
                {readOnly ? null : (
                  <TableCell>
                    <div className="flex gap-2">
                      <DepositDialog
                        members={members}
                        deposit={deposit}
                        trigger={
                          <Button type="button" variant="ghost" size="sm">
                            <Edit />
                            Edit
                          </Button>
                        }
                      />
                      <ConfirmDeleteDialog
                        title="Delete deposit"
                        description="This removes the selected deposit record from Supabase."
                        action={() => deleteDepositAction(deposit.id)}
                      />
                    </div>
                  </TableCell>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <TableCell className="py-10 text-center text-muted-foreground" colSpan={readOnly ? 5 : 6}>
                No deposit records found.
              </TableCell>
            </tr>
          )}
        </DataTable>
        <Pagination
          page={Math.min(page, totalPages)}
          totalPages={totalPages}
          totalItems={filteredDeposits.length}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
