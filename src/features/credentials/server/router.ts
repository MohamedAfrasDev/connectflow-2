import { PAGINATION } from "@/config/constants";
import { Edge, Node } from "@xyflow/react";
import { CredentialType } from "@/generated/prisma/enums";
import prisma from "@/lib/db";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
import { generateSlug } from "random-word-slugs";
import z, { email } from "zod";


export const credentialsRouter = createTRPCRouter({

    create: premiumProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().optional(), // optional
        email: z.string().optional(),
        appPassword: z.string().optional(),
      })
      .superRefine((data, ctx) => {
        if (data.type === CredentialType.GMAIL) {
          if (!data.email) {
            ctx.addIssue({
              path: ["email"],
              message: "Email is required for Gmail",
              code: "custom",
            });
          }
          if (!data.appPassword || data.appPassword.length < 10) {
            ctx.addIssue({
              path: ["appPassword"],
              message: "App password is required and must be at least 10 characters",
              code: "custom",
            });
          }
        } else {
          if (!data.value || data.value.length < 1) {
            ctx.addIssue({
              path: ["value"],
              message: "API key is required",
              code: "custom",
            });
          }
        }
      })
    )
    .mutation(({ ctx, input }) => {
      return prisma.credential.create({
        data: {
          name: input.name,
          userId: ctx.auth.user.id,
          type: input.type,
          value: input.value ?? null,           // only required for non-Gmail
          email: input.email ?? null,           // only for Gmail
          appPassword: input.appPassword ?? null,
        },
      });
    }),
  
  
    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => {
            return prisma.credential.delete({
                where: {
                    id: input.id,
                    userId: ctx.auth.user.id,

                }
            })
        }),



    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1, "Name is required"),
                type: z.enum(CredentialType),
                value: z.string().min(1, "Value is required").optional(),
                email: z.string().email().optional(),
                appPassword: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {

            const { id, name, type, value } = input;

            // const credential = await prisma.credential.findUniqueOrThrow({
            //     where: { id, userId: ctx.auth.user.id }
            // });

            return await prisma.$transaction(async (tx) => {
                await tx.node.deleteMany({
                    where: { workflowId: id }
                });
                
                
                return prisma.credential.update({
                    where: { id, userId: ctx.auth.user.id},
                    data: {
                        name,
                        type,
                        value
                    }
                })

            })
        }),



    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
             return  prisma.credential.findFirst({
                where: { id: input.id, userId: ctx.auth.user.id },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    createdAt: true,
                    updatedAt: true,
                    value: true,
                    appPassword: true,
                    email: true
                }
            });

          
        }),
    getMany: protectedProcedure
        .input(
            z.object({
                page: z.number().default(PAGINATION.DEFAULT_PAGE),
                pageSize: z
                    .number()
                    .min(PAGINATION.MIN_PAGE_SIZE)
                    .max(PAGINATION.MAX_PAGE_SIZE)
                    .default(PAGINATION.DEFAULT_PAGE_SIZE),
                search: z.string().default(""),
            })
        )
        .query(async ({ ctx, input }) => {
            const { page, pageSize, search } = input;
            const [items, totalCount] = await Promise.all([
                prisma.credential.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        userId: ctx.auth.user.id,
                        name: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                    orderBy: { updatedAt: "desc" },
                 
                }),
                prisma.credential.count({
                    where: {
                        userId: ctx.auth.user.id,
                        name: {
                            contains: search,
                            mode: "insensitive"
                        }
                    }
                })
            ])
            const totalPages = Math.ceil(totalCount / pageSize);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                items: items,
                page,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage,
                hasPreviousPage,
            }

        }),

        getByType: protectedProcedure
        .input(
            z.object({
                type: z.enum(CredentialType)
            })
        )
        .query(async ({ input, ctx}) => {
            const { type } = input;

           return prisma.credential.findMany({
                where: { type, userId: ctx.auth.user.id},
                orderBy: {
                    updatedAt: "desc"
                }
            })
        })

})