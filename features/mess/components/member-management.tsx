"use client";

import { useMemo, useState, useTransition } from "react";
import { Edit, Eye, Plus, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Pagination, TableToolbar } from "@/components/common/table-shell";
import { addMemberAction, deleteMemberAction, updateMemberAction } from "@/features/mess/actions";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import type { MemberFinancialSummary } from "@/services/mess/queries";

const PAGE_SIZE = 8;

function statusVariant(status: MemberFinancialSummary["status"]) {
  if (status === "due") {
    return "destructive";
  }

  if (status === "advance") {
    return "secondary";
  }

  return "default";
}

function AddMemberDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await addMemberAction({ email });
      showToast({
        title: result.success ? "Member added" : "Could not add member",
        description: result.message,
        variant: result.success ? "success" : "error"
      });

      if (result.success) {
        setEmail("");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Add member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>
              Add an existing registered member account to this mess by email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-5">
            <Label htmlFor="member-email">Member email</Label>
            <Input
              id="member-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="member@example.com"
              className="mt-2"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding" : "Add member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditMemberDialog({ member }: { member: MemberFinancialSummary }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(member.users?.name ?? "");
  const [phone, setPhone] = useState(member.users?.phone ?? "");
  const [avatar, setAvatar] = useState(member.users?.avatar ?? "");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateMemberAction({
        id: member.id,
        name,
        phone,
        avatar
      });
      showToast({
        title: result.success ? "Member updated" : "Could not update member",
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
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <Edit />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Edit member</DialogTitle>
            <DialogDescription>Update member details visible in this mess.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-5">
            <div className="space-y-2">
              <Label htmlFor={`member-name-${member.id}`}>Name</Label>
              <Input
                id={`member-name-${member.id}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`member-phone-${member.id}`}>Phone</Label>
              <Input
                id={`member-phone-${member.id}`}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`member-avatar-${member.id}`}>Photo URL</Label>
              <Input
                id={`member-avatar-${member.id}`}
                type="url"
                value={avatar}
                onChange={(event) => setAvatar(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ViewMemberDialog({ member }: { member: MemberFinancialSummary }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <Eye />
          View
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{member.users?.name ?? "Member details"}</DialogTitle>
          <DialogDescription>{member.users?.email ?? "No email available"}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Avatar>
              <AvatarImage src={member.users?.avatar ?? undefined} alt={member.users?.name ?? "Member"} />
              <AvatarFallback>{getInitials(member.users?.name ?? "Member")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{member.users?.name ?? "Unknown member"}</p>
              <p className="text-muted-foreground">{member.users?.phone ?? "No phone"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-muted-foreground">Meals</p>
              <p className="mt-1 font-medium">{member.totalMeals}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-muted-foreground">Deposit</p>
              <p className="mt-1 font-medium">{formatCurrency(member.totalDeposits)}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-muted-foreground">Balance</p>
              <p className="mt-1 font-medium">{formatCurrency(member.balance)}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-muted-foreground">Status</p>
              <Badge className="mt-1 capitalize" variant={statusVariant(member.status)}>
                {member.status}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground">Joined {formatDate(member.joined_at)}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MemberManagement({
  members,
  readOnly = false
}: {
  members: MemberFinancialSummary[];
  readOnly?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return members;
    }

    return members.filter((member) =>
      [
        member.users?.name,
        member.users?.email,
        member.users?.phone,
        member.status
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term))
    );
  }, [members, search]);
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const visibleMembers = filteredMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function onSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search members by name, email, phone, status"
      >
        {readOnly ? null : <AddMemberDialog />}
      </TableToolbar>

      {visibleMembers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.users?.avatar ?? undefined} alt={member.users?.name ?? "Member"} />
                      <AvatarFallback>{getInitials(member.users?.name ?? "Member")}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <CardTitle className="truncate">{member.users?.name ?? "Unknown member"}</CardTitle>
                      <CardDescription className="truncate">
                        {member.users?.phone ?? member.users?.email ?? "No contact"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="capitalize" variant={statusVariant(member.status)}>
                    {member.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground">Meals</p>
                    <p className="mt-1 font-medium">{member.totalMeals}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground">Deposit</p>
                    <p className="mt-1 font-medium">{formatCurrency(member.totalDeposits)}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground">Balance</p>
                    <p className="mt-1 font-medium">{formatCurrency(member.balance)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ViewMemberDialog member={member} />
                  {readOnly ? null : (
                    <>
                      <EditMemberDialog member={member} />
                      <ConfirmDeleteDialog
                        title="Delete member"
                        description="This removes the member from the mess and deletes their related meal and deposit records."
                        action={() => deleteMemberAction(member.id)}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
            <Users className="size-8 text-muted-foreground" />
            <div>
              <p className="font-medium">No members found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a registered member account or adjust the search term.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Pagination
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
        totalItems={filteredMembers.length}
        onPageChange={setPage}
      />
    </div>
  );
}
