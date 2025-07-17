import { cookies } from "next/headers";

// Generic helper for any server-side authenticated fetch
export async function serverAuthenticatedFetch(
  input: RequestInfo,
  init?: RequestInit
) {
  const cookieStore = await cookies(); // Await cookies for Next.js app dir
  const cookieString = cookieStore.toString();

  console.log(`[serverAuthenticatedFetch] Fetching:`, input);

  const res = await fetch(input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      cookie: cookieString,
    },
    credentials: "include",
  });

  if (res.status === 401) {
    console.log(
      `[serverAuthenticatedFetch] 401 detected, needs client refresh for:`,
      input
    );
    // Signal to the page/component that a client-side refresh is needed
    return { needsRefresh: true, status: 401 };
  }

  console.log(`[serverAuthenticatedFetch] Success for:`, input);
  return res;
}

// Type guard to check if value is a Response
export function isResponse(val: unknown): val is Response {
  if (typeof val === "object" && val !== null) {
    const obj = val as Response;
    return typeof obj.ok === "boolean" && typeof obj.json === "function";
  }
  return false;
}

// Helper for getting the current user (returns user object, { needsRefresh }, or null)
export async function getServerUser() {
  console.log(`[getServerUser] Attempting to get user...`);
  const res = await serverAuthenticatedFetch("http://localhost:5000/users/me");
  if (!isResponse(res)) {
    console.log(`[getServerUser] Needs refresh (401)`);
    return res; // { needsRefresh: true }
  }
  if (!res.ok) {
    console.log(`[getServerUser] Not logged in or error`);
    return null;
  }
  const user = await res.json();
  console.log(`[getServerUser] User data fetched:`, user);
  return user;
}
