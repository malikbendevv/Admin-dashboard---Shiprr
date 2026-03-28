// "use client";

import { getAllUsers, NeedsRefreshError } from "@/lib/api/users.server";
import ClientRefresh from "@/components/ClientRefresh";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import Providers from "./providers";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

export default async function Home() {
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ["users", { page: 1, limit: 1 }],
      queryFn: async () => {
        const result = await getAllUsers({
          page: 1,
          limit: 1,
        });

        if (!result) {
          throw new Error("Not authenticated");
        }

        return result;
      },
    });
  } catch (e) {
    if (e instanceof NeedsRefreshError) {
      return <ClientRefresh />;
    }
    console.error("Error prefetching users:", e);
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <Providers dehydratedState={dehydratedState}>
      <ErrorBoundary>
        <DashboardLayout />
      </ErrorBoundary>
    </Providers>
  );
}
