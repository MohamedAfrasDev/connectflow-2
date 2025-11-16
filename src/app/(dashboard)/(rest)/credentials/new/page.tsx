import { CredentialForm } from "@/features/credentials/components/credential";
import { CredentialsError, CredentialsLoading } from "@/features/credentials/components/credentials";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "@sentry/nextjs";
import { Suspense } from "react";

const Page = async () => {

    await requireAuth();
    return (
        <div className="p-4 md:px-10 md:py-6 h-full">
         <div className="mx-auto max-w-3xl w-full flex flex-col gap-y-8 h-full">
       <HydrateClient>
        <ErrorBoundary fallback={<CredentialsError/>}>
      <Suspense fallback={<CredentialsLoading/>}>
      <CredentialForm/>
      </Suspense>
        </ErrorBoundary>
       </HydrateClient>
         </div>
        </div>
    );
}

export default Page;