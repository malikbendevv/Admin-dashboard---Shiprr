"use client";
import { useEffect } from "react";
import api from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";

export default function ClientRefresh() {
  const router = useRouter();

  useEffect(() => {
    api
      .post("/auth/refresh-token")
      .then(() => {
        router.refresh(); // reloads the page, server component will now have valid token
      })
      .catch(() => {
        router.push("/auth"); // redirect to login if refresh fails
      });
  }, [router]);

  return <div>Refreshing session...</div>;
}
