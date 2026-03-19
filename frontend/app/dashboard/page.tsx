"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

type User = {
  id: number;
  email: string;
  name: string;
  role: "super_admin" | "member";
};

export default function Dashboard() {

  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {

    const loadUser = async () => {

      if (!isLoaded || !isSignedIn) return;

      const token = await getToken();

      console.log("TOKEN:", token);

      const res = await axios.get("http://127.0.0.1:8000/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);
    };

    loadUser();

  }, [isLoaded, isSignedIn]);

  if (!isLoaded) return <div>Loading Clerk...</div>;

  if (!isSignedIn) return <div>Please login</div>;

  if (!user) return <div>Loading user...</div>;

  if (user.role === "super_admin") {
    return <div>Admin Dashboard</div>;
  }

  return <div>User Dashboard</div>;
}