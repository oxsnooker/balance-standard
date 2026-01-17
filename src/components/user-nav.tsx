"use client";

import Link from "next/link";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import {
  LifeBuoy,
  LogOut,
  Settings,
  User as UserIcon,
  Shield,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function UserNav() {
  const userAvatar = PlaceHolderImages.find(
    (image) => image.id === "user-avatar"
  );
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [firestore, user]
  );
  const { data: currentUserData } = useDoc<{ role?: string }>(userDocRef);
  const isAdmin = currentUserData?.role === "admin";

  const handleLogout = async () => {
    await signOut(auth);
    // Redirect is handled by AuthRedirect component
  };

  return (
    <div className="flex items-center gap-4">
       {isAdmin && (
        <Button asChild variant="ghost" className="hidden md:inline-flex" size="sm">
          <Link href="/admin">
            <Shield className="mr-2 h-4 w-4" />
            Admin
          </Link>
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              {user?.photoURL ? (
                <AvatarImage src={user.photoURL} alt="User avatar" />
              ) : (
                userAvatar && (
                  <AvatarImage
                    src={userAvatar.imageUrl}
                    alt={userAvatar.description}
                    data-ai-hint={userAvatar.imageHint}
                  />
                )
              )}
              <AvatarFallback>
                {user?.email?.[0].toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.displayName || "Test User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
             {isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
