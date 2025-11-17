import { requireAuth } from "@/lib/auth-utils";
import { APITriggerButton } from "./api-trigger";

const Page = async () => {
  await requireAuth();

  return (
    <div className="p-4">
      <APITriggerButton />
    </div>
  );
};

export default Page;
