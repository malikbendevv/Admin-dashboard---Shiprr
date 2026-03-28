import { cookies } from "next/headers";
import type { NeedsRefresh } from "@/types";

export async function serverAuthenticatedFetch(
  input: RequestInfo,
  init?: RequestInit
) {
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();

  const res = await fetch(input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      cookie: cookieString,
    },
    credentials: "include",
  });

  if (res.status === 401) {
    return { needsRefresh: true, status: 401 } as NeedsRefresh;
  }

  return res;
}

export function isResponse(val: unknown): val is Response {
  if (typeof val === "object" && val !== null) {
    const obj = val as Response;
    return typeof obj.ok === "boolean" && typeof obj.json === "function";
  }
  return false;
}

export async function getServerUser(): Promise<NeedsRefresh | null | unknown> {
  const res = await serverAuthenticatedFetch("http://localhost:5000/users/me");
  if (!isResponse(res)) {
    return res;
  }
  if (!res.ok) {
    return null;
  }
  return res.json();
}
