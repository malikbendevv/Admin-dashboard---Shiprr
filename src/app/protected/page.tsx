import { getServerUser } from "@/lib/serverAuth";
import type { NeedsRefresh, User } from "@/types";
import ClientRefresh from "@/components/ClientRefresh";

function isNeedsRefresh(val: unknown): val is NeedsRefresh {
  return (
    typeof val === "object" &&
    val !== null &&
    (val as NeedsRefresh).needsRefresh === true
  );
}

export default async function ProtectedPage() {
  const user = await getServerUser();

  if (isNeedsRefresh(user)) {
    return <ClientRefresh />;
  }

  if (!user) {
    return <div>You are not logged in.</div>;
  }

  const typedUser = user as User;

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome, {typedUser.email}!</p>
    </div>
  );
}
