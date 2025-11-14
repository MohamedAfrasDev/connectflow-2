import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@/generated/prisma/client";
import { checkout, polar, portal } from "@polar-sh/better-auth";

import { polarClient } from "./polar";

const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                portal({
                    // You can use the same URL or a different one (e.g., /settings)
                    returnUrl: process.env.POLAR_SUCCESS_URL, 
                }),
                checkout({
                    products: [
                        {
                            productId: "a1c18c22-239d-4e05-b421-179349c6cc74",
                            slug: "pro",
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true,
                })
            ]
        })
    ]
});