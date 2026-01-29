"use client";

import {
  useUser,
  useFirestore,
  useCollection,
  useDoc,
  useMemoFirebase,
} from "@/firebase";
import { collection, doc } from "firebase/firestore";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UpdateBalanceDialog } from "@/components/update-balance-dialog";
import { DeleteUserDialog } from "@/components/delete-user-dialog";
import { UpdateRoleDialog } from "@/components/update-role-dialog";

interface UserAccount {
  id: string;
  email: string;
  role: "admin" | "user";
  registrationDate: string;
  balance: number;
  displayName?: string;
}

export default function AdminPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [visibleBalances, setVisibleBalances] = useState<
    Record<string, boolean>
  >({});

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [firestore, user]
  );
  const { data: currentUserData, isLoading: isCurrentUserLoading } = useDoc<{
    role: string;
  }>(userDocRef);

  const usersCollectionRef = useMemoFirebase(
    () =>
      currentUserData?.role === "admin"
        ? collection(firestore, "users")
        : null,
    [firestore, currentUserData]
  );

  const { data: users, isLoading: areUsersLoading } =
    useCollection<UserAccount>(usersCollectionRef);

  const isAdmin = currentUserData?.role === "admin";

  const toggleBalanceVisibility = (userId: string) => {
    setVisibleBalances((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  if (isCurrentUserLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/5" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Please contact an administrator if you believe this is a mistake.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          User Management
        </h1>
        <p className="text-muted-foreground">
          Manage user roles and permissions.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Registered On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areUsersLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Skeleton className="h-8 w-28" />
                          <Skeleton className="h-8 w-28" />
                          <Skeleton className="h-8 w-32" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                users?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.displayName || u.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-accent w-24 truncate">
                          {visibleBalances[u.id]
                            ? `₹${(u.balance || 0).toFixed(2)}`
                            : "₹ •••.••"}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleBalanceVisibility(u.id)}
                        >
                          {visibleBalances[u.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {visibleBalances[u.id]
                              ? "Hide balance"
                              : "Show balance"}
                          </span>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.role}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(u.registrationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/transactions/${u.id}`}>
                            Transactions
                          </Link>
                        </Button>
                        <UpdateBalanceDialog
                          userId={u.id}
                          userEmail={u.displayName || u.email}
                        />
                        <UpdateRoleDialog
                          userId={u.id}
                          userEmail={u.displayName || u.email}
                          currentRole={u.role}
                          disabled={u.id === user?.uid}
                        />
                        <DeleteUserDialog
                          userId={u.id}
                          userEmail={u.displayName || u.email}
                          disabled={u.id === user?.uid}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
