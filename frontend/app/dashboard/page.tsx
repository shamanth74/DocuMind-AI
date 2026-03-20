"use client";

import { useUser } from "@clerk/nextjs";
import AdminDashboard from "@/components/AdminDashboard";
import UserDashboard from "@/components/UserDashboard";

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useUser();

  // Mock role — change to "super_admin" to test admin view
  const role = "member";

  if (!isLoaded) return <div className="h-screen w-full flex items-center justify-center text-neutral-500 text-sm">Loading...</div>;

  if (!isSignedIn) return <div className="h-screen w-full flex items-center justify-center text-neutral-500 text-sm">Please login</div>;

  if (role === "super_admin") {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}