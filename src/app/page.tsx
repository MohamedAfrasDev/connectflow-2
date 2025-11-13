

"use client";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import LogoutButton from "./logout";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Page =  () => {
  //await requireAuth();
  const trpc = useTRPC();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());
const queryClient = useQueryClient();

const testAi = useMutation(trpc.testAi.mutationOptions({
  onSuccess: () => {
    toast.success("AI Job Qued")

  },
  onError: () => {
    toast.error("Something went wrong")
  },
}));
  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess: () => {
     toast.success("Job Qued")
    }
  }));
  return (
    <div className="text-red-500">
     protected server component
     {JSON.stringify(data)}

     <Button disabled={create.isPending}  onClick={() => create.mutate()}>
      Create Workflow
     </Button>
     <Button disabled={testAi.isPending}  onClick={() => testAi.mutate()}>
      Test AI
     </Button>
     <LogoutButton/>
    </div>
  )
}

export default Page;