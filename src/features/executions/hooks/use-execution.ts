"use client"; // <-- ADD THIS LINE

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useExecutionParams } from "./use-execution-params";

export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionParams();

  return useSuspenseQuery({
    ...trpc.executions.getMany.queryOptions(params),
    refetchInterval: 2000, // poll every 2 seconds
    refetchIntervalInBackground: true,
  });
};

export const useSuspenseExecution = (id: string) => {
  const trpc = useTRPC();
  const [_params] = useExecutionParams();

  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};
