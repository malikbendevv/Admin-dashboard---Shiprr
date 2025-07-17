import { getServerUser } from "@/lib/serverAuth";
// import api from "@/lib/axiosInstance";
import ClientRefresh from "@/components/ClientRefresh";

export default async function ProtectedPage() {
  const user = await getServerUser();

  if ((user as any)?.needsRefresh) {
    return <ClientRefresh />;
  }

  if (!user) {
    return <div>You are not logged in.</div>;
  }

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome, {user.email}!</p>
    </div>
  );
}
