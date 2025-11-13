import { LoginForm } from "@/features/auth/components/login-form";
import { requireAuth, requireUnauth } from "@/lib/auth-utils";
import Link from "next/link";

const Page = async () => {

    await requireUnauth();
    return (
        <div className="bg-muted flex min-h-svh flex-col justify-center gap-6
        p-6 md:p-10">
            <div className="flex w-full max-w-wsm flex-col gap-6">
                <Link href="/" className="flex items-center gap-2">
                </Link>
                <LoginForm />
            </div>
        </div>
    );
};

export default Page;