import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
    await requireAuth();
    return (
        <div>
            Credentials
        </div>
    )
}

export default Page;