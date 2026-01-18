'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';

const AUTH_PAGES = ['/login', '/signup', '/forgot-password'];
const PUBLIC_PAGES = ['/'];

function isAuthPage(pathname: string) {
    return AUTH_PAGES.includes(pathname);
}

function isPublicPage(pathname: string) {
    return PUBLIC_PAGES.includes(pathname);
}

export default function AuthRedirect() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [firestore, user]
  );
  const { data: currentUserData, isLoading: isCurrentUserLoading } = useDoc<{
    role?: string;
  }> (userDocRef);

  const isLoading = isUserLoading || (user && isCurrentUserLoading);

  useEffect(() => {
    if (isLoading) return;

    const onAuthPage = isAuthPage(pathname);
    const onPublicPage = isPublicPage(pathname);
    const isAdmin = currentUserData?.role === 'admin';

    // User is not logged in
    if (!user) {
      if (!onAuthPage && !onPublicPage) {
        router.push('/login');
      }
      return;
    }

    // User is logged in
    if (user) {
      if (onAuthPage || onPublicPage) {
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push(`/transactions/${user.uid}`);
        }
        return;
      }
    }

    // If a non-admin tries to access admin pages, redirect to their transactions page
    if (!isAdmin && pathname.startsWith('/admin')) {
        router.push(`/transactions/${user.uid}`);
        return;
    }
    
    // Allow admins to view any transaction pages.
    if (isAdmin && pathname.startsWith('/transactions')) {
      return;
    }

    // If a regular user tries to access a transaction page that isn't theirs, redirect them to their own.
    if (!isAdmin && pathname.startsWith('/transactions/') && !pathname.endsWith(`/${user.uid}`)) {
        router.push(`/transactions/${user.uid}`);
        return;
    }

  }, [user, isLoading, currentUserData, router, pathname]);

  if(isLoading) {
    return (
        <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
            <Skeleton className="h-12 w-12 rounded-full" />
        </div>
    )
  }

  return null;
}
