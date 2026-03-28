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
  const url = new URL("http://localhost:5000/users");
  if (page) url.searchParams.set("page", String(page));
  if (limit) url.searchParams.set("limit", String(limit));

  const res = await serverAuthenticatedFetch(url.toString());
  if (!isResponse(res)) {
    throw new NeedsRefreshError();
  }
  if (!res.ok) {
    return null;
  }
  return res.json();
}
