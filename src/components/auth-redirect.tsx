'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) return;

    const onAuthPage = isAuthPage(pathname);
    const onPublicPage = isPublicPage(pathname);

    if (user) { // If user is logged in
        if (onAuthPage || onPublicPage) {
            router.push('/dashboard');
        }
    } else { // If user is not logged in
        if (!onAuthPage && !onPublicPage) {
            router.push('/login');
        }
    }
  }, [user, isUserLoading, router, pathname]);

  if(isUserLoading) {
    return (
        <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
            <Skeleton className="h-12 w-12 rounded-full" />
        </div>
    )
  }

  return null;
}
