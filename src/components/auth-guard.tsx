"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4 p-4">
            <Skeleton className="h-20 w-full max-w-4xl" />
            <Skeleton className="h-64 w-full max-w-4xl" />
        </div>
    );
  }

  return <>{children}</>;
}
