import { isResponse, serverAuthenticatedFetch } from "../serverAuth";

export class NeedsRefreshError extends Error {
  constructor() {
    super("Access token expired. Needs client refresh.");
    this.name = "NeedsRefreshError";
  }
}

export async function getAllUsers({
  page,
  limit,
}: {
  page?: number;
  limit?: number;
}) {
  console.log(`[getServerUser] Attempting to get all users...`);

  const url = new URL("http://localhost:5000/users");
  if (page) url.searchParams.set("page", String(page));
  if (limit) url.searchParams.set("limit", String(limit));

  const res = await serverAuthenticatedFetch(url.toString());
  if (!isResponse(res)) {
    console.log(`[getServerUser] Needs refresh (401)`);
    throw new NeedsRefreshError();
  }
  if (!res.ok) {
    console.log(`[getServerUser] Not logged in or error`);
    return null;
  }
  const users = await res.json();
  console.log(`[getServerUser] All users data fetched:`, users);
  return users;
}
