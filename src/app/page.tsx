// "use client";

import { getAllUsers, NeedsRefreshError } from "@/lib/api/users.server";
import ClientRefresh from "@/components/ClientRefresh";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import Providers from "./providers";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

export default async function Home() {
  const queryClient = new QueryClient();

  console.log("Google api key", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  try {
    console.log("trying to fetch");
    await queryClient.prefetchQuery({
      queryKey: ["users", { page: 1, limit: 1 }],
      queryFn: async () => {
        const result = await getAllUsers({
          page: 1,
          limit: 1,
        });

        console.log("result fro mdashboard home", result);

        if (!result) {
          console.log("no result fro mdashboard home ", result);

          throw new Error("Not authenticated");
        }

        return result;
      },
    });
  } catch (e) {
    console.log("error", e);
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
