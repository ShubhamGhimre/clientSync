"use client";

import { useAuthContext } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"];

export default function AuthHandler({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If on a public path, do nothing
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) return;

    // If not authenticated, redirect to login
    if (!user) {
      router.replace("/auth/login");
    }
  }, [user, pathname, router]);

  // Optionally, show a loading spinner while checking auth
  if (!user && !PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}