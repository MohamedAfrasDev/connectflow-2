import type { SearchParams } from "nuqs";
import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";
import {
  ExecutionList,
  ExecutionsContainer,
  ExecutionsError,
  ExecutionsLoading,
} from "@/features/executions/components/executions";
import { executionParamsLoader } from "@/features/executions/server/params-loader";
import { prefetchExecutions } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

type Props = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
  const params = await executionParamsLoader(searchParams);
  prefetchExecutions(params);
  await requireAuth();

  // In your JSX

  return (
    <ExecutionsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<ExecutionsError />}>
          <Suspense fallback={<ExecutionsLoading />}>
            <ExecutionList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </ExecutionsContainer>
  );
};

export default Page;
