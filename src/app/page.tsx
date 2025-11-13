
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import LogoutButton from "./logout";

const Page = async () => {
  await requireAuth();

  const data = await caller.getUsers();
  return (
    <div className="text-red-500">
     protected server component
     {JSON.stringify(data)}
     <LogoutButton/>
    </div>
  )
}

export default Page;