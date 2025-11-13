import { LoginForm } from "@/features/auth/components/login-form";
import { requireAuth, requireUnauth } from "@/lib/auth-utils";
import Image from "next/image";
import Link from "next/link";
import Layout from "../layout";

const Page = async () => {

    await requireUnauth();
    return <LoginForm/>
};

export default Page;