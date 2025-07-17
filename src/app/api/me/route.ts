// app/api/me/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // 👈 this is the key

export async function GET() {
  const cookieStore = cookies();
  const cookieString = cookieStore.toString();

  const res = await fetch("http://localhost:5000/users/me", {
    headers: {
      cookie: cookieString,
    },
    credentials: "include",
  });

  const data = await res.json();
  return NextResponse.json(data);
}
