"use client";

import {
  useUser,
  useFirestore,
  useCollection,
  useDoc,
  useMemoFirebase,
} from "@/firebase";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc } from "firebase/firestore";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface UserAccount {
  id: string;
  email: string;
  role: "admin" | "user";
  registrationDate: string;
}

export default function AdminPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [firestore, user]
  );
  const { data: currentUserData, isLoading: isCurrentUserLoading } = useDoc<{
    role: string;
  }>(userDocRef);

  const usersCollectionRef = useMemoFirebase(
    () => (currentUserData?.role === "admin" ? collection(firestore, "users") : null),
    [firestore, currentUserData]
  );

  const { data: users, isLoading: areUsersLoading } =
    useCollection<UserAccount>(usersCollectionRef);

  const isAdmin = currentUserData?.role === "admin";

  const handleRoleChange = (userId: string, newRole: "admin" | "user") => {
    if (!user || userId === user.uid) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You cannot change your own role.",
      });
      return;
    }
    const userDocToUpdateRef = doc(firestore, "users", userId);
    updateDocumentNonBlocking(userDocToUpdateRef, { role: newRole });
    toast({ title: "Success", description: `User role updated to ${newRole}.` });
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
          <p>Please contact an administrator if you believe this is a mistake.</p>
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
                <TableHead>Email</TableHead>
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
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                       <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                users?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.role}
                    </TableCell>
                     <TableCell className="text-muted-foreground">
                      {new Date(u.registrationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        defaultValue={u.role}
                        onValueChange={(value: "admin" | "user") =>
                          handleRoleChange(u.id, value)
                        }
                        disabled={u.id === user?.uid}
                      >
                        <SelectTrigger className="w-[120px] ml-auto">
                          <SelectValue placeholder="Change role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
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
