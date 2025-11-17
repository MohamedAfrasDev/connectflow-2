

import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { SearchParams } from "nuqs";
import { credentialsParamsLoader } from "@/features/credentials/server/params-loader";
import { prefetchCredentials } from "@/features/credentials/server/prefetch";
import { CredentialsContainer, CredentialsError, CredentialsLoading, CredentiaslList } from "@/features/credentials/components/credentials";
import { Button } from "@/components/ui/button";


type Props = {
    searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {

    const params = await credentialsParamsLoader(searchParams);
    prefetchCredentials(params);
    await requireAuth();
   
      
      // In your JSX
      
    return (
       <CredentialsContainer>
         <HydrateClient>
            <ErrorBoundary fallback={<CredentialsError/>}>
                <Suspense fallback={<CredentialsLoading/>}>
                
                    <CredentiaslList/>
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
       </CredentialsContainer>
    )
}

export default Page;