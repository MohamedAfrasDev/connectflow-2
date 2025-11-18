import { PAGINATION } from "@/config/constants";
// Edge and Node are not used in this file, so they can be removed if you wish
// import { Edge, Node } from "@xyflow/react"; 
import { CredentialType } from "@/generated/prisma/";
import prisma from "@/lib/db";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
// generateSlug is not used, can be removed
// import { generateSlug } from "random-word-slugs"; 
import z from "zod";
// 'email' is not used directly, can be removed
// import { email } from "zod";


export const credentialsRouter = createTRPCRouter({

  create: premiumProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().optional(),
        email: z.string().optional(),
        appPassword: z.string().optional(),
        
        // --- ADDED ---: New fields for CustomMail
        smtpHost: z.string().optional(),
        smtpPort: z.number().optional(), // Must match schema (Int)
        smtpUser: z.string().optional(),
        smtpPassword: z.string().optional(),
        secure: z.boolean().optional(),
        instagramBusinessId: z.string().optional(),
      })
      .superRefine((data, ctx) => {
        // --- UPDATED ---: Logic to handle all 3 credential types
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
        } else if (data.type === CredentialType.CustomMail) {
          // --- ADDED ---: Validation for CustomMail
          if (!data.smtpHost) {
            ctx.addIssue({ path: ["smtpHost"], message: "SMTP host required", code: "custom" });
          }
          if (!data.smtpPort) {
            ctx.addIssue({ path: ["smtpPort"], message: "SMTP port required", code: "custom" });
          }
          if (!data.smtpUser) {
            ctx.addIssue({ path: ["smtpUser"], message: "SMTP username required", code: "custom" });
          }
          if (!data.smtpPassword) {
            ctx.addIssue({ path: ["smtpPassword"], message: "SMTP password required", code: "custom" });
          }
          if (!data.instagramBusinessId) {
            if (!data.value) ctx.addIssue({ path: ["value"], message: "Access token is required for Instagram", code: "custom" });
            if (!data.instagramBusinessId) ctx.addIssue({ path: ["instagramBusinessId"], message: "Instagram Business ID is required", code: "custom" });
          }
        } else {
          // --- UPDATED ---: This is for API Keys (OpenAI, Gemini, etc.)
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
          value: input.value ?? null,
          email: input.email ?? null,
          appPassword: input.appPassword ?? null,

          // --- ADDED ---: Save new fields to database
          smtpHost: input.smtpHost ?? null,
          smtpPort: input.smtpPort ?? null,
          smtpUser: input.smtpUser ?? null,
          smtpPassword: input.smtpPassword ?? null,
          secure: input.secure ?? false,
          instagramBusinessId: input.instagramBusinessId ?? null
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
        value: z.string().optional(), // --- UPDATED --- (was min(1))
        email: z.string().email().optional(),
        appPassword: z.string().optional(),

        // --- ADDED ---: New fields for CustomMail
        smtpHost: z.string().optional(),
        smtpPort: z.number().optional(),
        smtpUser: z.string().optional(),
        smtpPassword: z.string().optional(),
        secure: z.boolean().optional(),
        instagramBusinessId: z.string().optional()
      })
      // --- ADDED ---: We should also validate the update
      .superRefine((data, ctx) => {
        if (data.type === CredentialType.GMAIL) {
          if (!data.email) {
            ctx.addIssue({ path: ["email"], message: "Email is required for Gmail", code: "custom" });
          }
          if (!data.appPassword || data.appPassword.length < 10) {
            ctx.addIssue({ path: ["appPassword"], message: "App password required (min 10 chars)", code: "custom" });
          }
        } else if (data.type === CredentialType.CustomMail) {
          if (!data.smtpHost) ctx.addIssue({ path: ["smtpHost"], message: "SMTP host required", code: "custom" });
          if (!data.smtpPort) ctx.addIssue({ path: ["smtpPort"], message: "SMTP port required", code: "custom" });
          if (!data.smtpUser) ctx.addIssue({ path: ["smtpUser"], message: "SMTP username required", code: "custom" });
          if (!data.smtpPassword) ctx.addIssue({ path: ["smtpPassword"], message: "SMTP password required", code: "custom" });
        } else {
          // API Key types
          if (!data.value || data.value.trim().length < 1) {
            ctx.addIssue({ path: ["value"], message: "API key required", code: "custom" });
          }
        }
      })
    )
    .mutation(async ({ ctx, input }) => {
      // --- UPDATED ---: Removed the incorrect transaction that was deleting nodes.
      // Updating a credential should not delete the nodes that use it.
      return prisma.credential.update({
        where: { id: input.id, userId: ctx.auth.user.id },
        data: {
          name: input.name,
          type: input.type,
          value: input.value ?? null,
          email: input.email ?? null,
          appPassword: input.appPassword ?? null,
          
          // --- ADDED ---: Save updated SMTP fields
          smtpHost: input.smtpHost ?? null,
          smtpPort: input.smtpPort ?? null,
          smtpUser: input.smtpUser ?? null,
          smtpPassword: input.smtpPassword ?? null,
          secure: input.secure ?? false,
          instagramBusinessId: input.instagramBusinessId ?? null
        }
      })
    }),



  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return prisma.credential.findFirst({
        where: { id: input.id, userId: ctx.auth.user.id },
        select: {
          id: true,
          name: true,
          type: true,
          createdAt: true,
          updatedAt: true,
          value: true,
          appPassword: true,
          email: true,

          // --- ADDED ---: Send new fields to the frontend for editing
          smtpHost: true,
          smtpPort: true,
          smtpUser: true,
          smtpPassword: true,
          secure: true,
          instagramBusinessId: true
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
    .query(async ({ input, ctx }) => {
      const { type } = input;

      return prisma.credential.findMany({
        where: { type, userId: ctx.auth.user.id },
        orderBy: {
          updatedAt: "desc"
        }
      })
    })

})