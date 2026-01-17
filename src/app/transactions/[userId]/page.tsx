"use client";

import {
  useUser,
  useFirestore,
  useCollection,
  useDoc,
  useMemoFirebase,
} from "@/firebase";
import { collection, doc, query, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Define interfaces for data
interface UserAccount {
  id: string;
  email: string;
  role: "admin" | "user";
  balance: number;
  displayName?: string;
}

interface Transaction {
  id: string;
  type: "balance" | "payment";
  amount: number;
  description: string;
  timestamp: string;
}

export default function TransactionHistoryPage() {
  const params = useParams();
  const userId = params.userId as string;

  const { user: currentUser, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Get current user's role to check for admin
  const currentUserDocRef = useMemoFirebase(
    () => (currentUser ? doc(firestore, "users", currentUser.uid) : null),
    [firestore, currentUser]
  );
  const { data: currentUserAccount, isLoading: isCurrentUserAccountLoading } =
    useDoc<{ role: string }>(currentUserDocRef);
  const isAdmin = currentUserAccount?.role === "admin";

  // Check for permission to view this page
  const canView = isAdmin || currentUser?.uid === userId;

  // Fetch target user's data
  const userDocRef = useMemoFirebase(
    () => (canView && userId ? doc(firestore, "users", userId) : null),
    [firestore, userId, canView]
  );
  const { data: targetUser, isLoading: isTargetUserLoading } =
    useDoc<UserAccount>(userDocRef);

  // Fetch target user's transactions
  const transactionsCollectionRef = useMemoFirebase(
    () =>
      canView && userId
        ? query(
            collection(firestore, "users", userId, "transactions"),
            orderBy("timestamp", "desc"),
            limit(50)
          )
        : null,
    [firestore, userId, canView]
  );
  const {
    data: transactions,
    isLoading: areTransactionsLoading,
  } = useCollection<Transaction>(transactionsCollectionRef);

  const isLoading =
    isUserLoading ||
    isCurrentUserAccountLoading ||
    isTargetUserLoading ||
    areTransactionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/5" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canView) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please contact an administrator if you believe this is a mistake.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" size="sm">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {targetUser?.displayName || targetUser?.email}
          </CardTitle>
          <CardDescription>
            Current Balance:{" "}
            <span className="font-bold text-foreground">
              ${(targetUser?.balance || 0).toFixed(2)}
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Showing the last 50 transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.type === "payment" ? "destructive" : "secondary"}
                        className="capitalize"
                      >
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono ${
                        tx.type === "payment" ? "text-destructive" : ""
                      }`}
                    >
                      {tx.type === "payment" ? "-" : "+"}$
                      {tx.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
