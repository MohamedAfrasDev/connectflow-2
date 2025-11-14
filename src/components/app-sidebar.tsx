"use client";

import {
  CreditCardIcon,
  FolderOpenIcon,
  LogOutIcon,
  StarIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { authClient } from "@/lib/auth-client";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const menuItems = [
  {
    title: "Main",
    items: [
      { title: "Workflows", icon: FolderOpenIcon, url: "/workflows" },
      { title: "Credentials", icon: FolderOpenIcon, url: "/credentials" },
      { title: "Executions", icon: FolderOpenIcon, url: "/executions" },
    ],
  },
];

export const AppSidebar = () => {
  const router = useRouter();
  const pathName = usePathname();
  const { hasActiveSubscription, isLoading, refetch, customerState } =
    useHasActiveSubscription();
  const queryClient = useQueryClient();

  // Poll for subscription updates every 5 seconds if not active
  useEffect(() => {
    if (!hasActiveSubscription) {
      const interval = setInterval(() => refetch(), 5000);
      return () => clearInterval(interval);
    }
  }, [hasActiveSubscription, refetch]);

  // Refetch on window focus (user may complete checkout in another tab)
  useEffect(() => {
    const onFocus = () => refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);

  // Handle Upgrade to Pro click
  const handleUpgrade = async () => {
    await authClient.checkout({ slug: "pro" });

    // Optimistically mark subscription active for immediate UI feedback
    queryClient.setQueryData(["subscription"], (old: any) => ({
      ...old,
      activeSubscriptions: [{ id: "pro", status: "active" }],
    }));

    // Refetch to sync with backend after a few seconds
    setTimeout(() => refetch(), 3000);
  };

  // Example click to view customer state
  const handleClick = () => {
    console.log(customerState);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
            <Link href="/workflows" prefetch>
              <Image src="/logos/logo.svg" alt="connectflow" width={30} height={30} />
              <span className="font-semibold text-sm">ConnectFlow</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={
                        item.url === "/" ? pathName === "/" : pathName.startsWith(item.url)
                      }
                      asChild
                      className="gap-x-4 h-10 px-4"
                    >
                      <Link href={item.url} prefetch>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {!hasActiveSubscription && !isLoading && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Upgrade to Pro"
                className="gap-x-4 h-10 px-4"
                onClick={handleUpgrade}
              >
                <StarIcon className="h-4 w-4" />
                <span>Upgrade to Pro</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Billing Portal"
              className="gap-x-4 h-10 px-4"
              onClick={handleClick}
            >
              <CreditCardIcon className="h-4 w-4" />
              <span>Billing Portal</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              className="gap-x-4 h-10 px-4"
              onClick={() =>
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/login");
                    },
                  },
                })
              }
            >
              <LogOutIcon className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
