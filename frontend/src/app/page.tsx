"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
    } else {
      router.replace("/dashboard"); // or your default protected page
    }
  }, [user, router]);

  return null;
}
