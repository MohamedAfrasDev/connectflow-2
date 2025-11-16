import { CredentialView } from "@/features/credentials/components/credential";
import { prefetchCredential } from "@/features/credentials/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
    params: Promise<{
        credentialId: string,
    }>
};

const Page = async ({ params } : PageProps) => {
    await requireAuth();

    const { credentialId} = await params;
    prefetchCredential(credentialId);
    return (
        <div className="p-4 md:px-10 md:py-6 h-full">
            <div className="mx-auto max-w-3xl w-full flex flex-col gap-y-8 h-full">
            <CredentialView credentialId={credentialId}/>
        </div>
        </div>
    )
}

export default Page;