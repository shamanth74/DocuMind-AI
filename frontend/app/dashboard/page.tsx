"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getCurrentUser, getWorkspaces, type User, type Workspace } from "@/services/api";
import AdminDashboard from "@/components/AdminDashboard";
import UserDashboard from "@/components/UserDashboard";

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = useCallback(async () => {
    const wsData = await getWorkspaces(getToken);
    setWorkspaces(wsData);
  }, [getToken]);

  useEffect(() => {
    const loadData = async () => {
      if (!isLoaded || !isSignedIn) return;

      try {
        const userData = await getCurrentUser(getToken);
        setUser(userData);

        const wsData = await getWorkspaces(getToken);
        setWorkspaces(wsData);
      } catch (err: any) {
        if (err?.status === 401) {
          router.push("/signin");
          return;
        }
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isLoaded, isSignedIn, getToken, router]);

  if (!isLoaded || loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-neutral-500 text-sm">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-neutral-500 text-sm">
        Please login
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-neutral-500 text-sm">
        Loading user...
      </div>
    );
  }

  if (user.role === "super_admin") {
    return <AdminDashboard workspaces={workspaces} getToken={getToken} onRefresh={refreshWorkspaces} />;
  }

  return <UserDashboard workspaces={workspaces} getToken={getToken} onRefresh={refreshWorkspaces} />;
}