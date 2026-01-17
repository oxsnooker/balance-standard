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
import { Button } from "@/components/ui/button";
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
import { UpdateBalanceDialog } from "@/components/update-balance-dialog";

interface UserAccount {
  id: string;
  email: string;
  role: "admin" | "user";
  balance: number;
  displayName?: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [firestore, user]
  );

  const { data: currentUserData, isLoading: isCurrentUserLoading } =
    useDoc<UserAccount>(userDocRef);

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

  const displayUsers = isAdmin
    ? users
    : currentUserData
    ? [currentUserData]
    : [];
  const isLoading = isCurrentUserLoading || (isAdmin && areUsersLoading);

  if (isLoading && !displayUsers?.length) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/5" />
            <Skeleton className="mt-2 h-4 w-2/5" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(isAdmin ? 3 : 1)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Skeleton className="h-8 w-28" />
                        {isAdmin && <Skeleton className="h-8 w-28" />}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back,{" "}
          {currentUserData?.displayName || currentUserData?.email || "user"}!
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Balances</CardTitle>
          <CardDescription>
            {isAdmin
              ? "An overview of all user balances in the system."
              : "Your current account balance."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  {[...Array(isAdmin ? 3 : 1)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                           <Skeleton className="h-8 w-28" />
                           {isAdmin && <Skeleton className="h-8 w-28" />}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                displayUsers?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.displayName || u.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ${(u.balance || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/transactions/${u.id}`}>
                            Transactions
                          </Link>
                        </Button>
                        {isAdmin && (
                          <UpdateBalanceDialog
                            userId={u.id}
                            userEmail={u.displayName || u.email}
                          />
                        )}
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
