import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
    await requireAuth();
    return (
        <div>
            Execution
        </div>
    )
}

export default Page;