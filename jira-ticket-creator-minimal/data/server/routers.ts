import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createJiraTicket as createJiraTicketDB } from "./db";
import { createJiraTicket as createJiraTicketAPI, CreateTicketData } from "./jira";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  ticket: router({
    create: publicProcedure
      .input(
        z.object({
          technology: z.string().min(1, "Technologie requise"),
          solutionCode: z.string().min(1, "Code solution requis"),
          environment: z.string().min(1, "Environnement requis"),
          squad: z.string().min(1, "Squad requise"),
          email: z.string().email("Email invalide"),
          cpu: z.number().optional(),
          ram: z.number().optional(),
          dbEngine: z.string().optional(),
          diskSize: z.number().optional(),
          storageType: z.string().optional(),
          storageQuota: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const jiraResponse = await createJiraTicketAPI(input as CreateTicketData);

          await createJiraTicketDB({
            jiraKey: jiraResponse.key,
            jiraUrl: jiraResponse.url,
            technology: input.technology,
            solutionCode: input.solutionCode,
            environment: input.environment,
            squad: input.squad,
            email: input.email,
            cpu: input.cpu,
            ram: input.ram,
            dbEngine: input.dbEngine,
            diskSize: input.diskSize,
            storageType: input.storageType,
            storageQuota: input.storageQuota,
            createdBy: null,
          });

          return {
            success: true,
            key: jiraResponse.key,
            url: jiraResponse.url,
          };
        } catch (error) {
          console.error("Error creating Jira ticket:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Erreur lors de la création du ticket Jira",
          });
        }
      }),

    createMultiple: publicProcedure
      .input(
        z.object({
          squad: z.string().min(1, "Squad requise"),
          email: z.string().email("Email invalide"),
          technologies: z.array(
            z.object({
              technology: z.string().min(1, "Technologie requise"),
              solutionCode: z.string().min(1, "Code solution requis"),
              environment: z.string().min(1, "Environnement requis"),
              cpu: z.number().optional(),
              ram: z.number().optional(),
              dbEngine: z.string().optional(),
              diskSize: z.number().optional(),
              storageType: z.string().optional(),
              storageQuota: z.number().optional(),
            })
          ).min(1, "Au moins une technologie requise"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const results: Array<{ key: string; url: string }> = [];

          for (const tech of input.technologies) {
            const ticketData: CreateTicketData = {
              technology: tech.technology,
              solutionCode: tech.solutionCode,
              environment: tech.environment,
              squad: input.squad,
              email: input.email,
              cpu: tech.cpu,
              ram: tech.ram,
              dbEngine: tech.dbEngine,
              diskSize: tech.diskSize,
              storageType: tech.storageType,
              storageQuota: tech.storageQuota,
            };

            const jiraResponse = await createJiraTicketAPI(ticketData);

            await createJiraTicketDB({
              jiraKey: jiraResponse.key,
              jiraUrl: jiraResponse.url,
              technology: tech.technology,
              solutionCode: tech.solutionCode,
              environment: tech.environment,
              squad: input.squad,
              email: input.email,
              cpu: tech.cpu,
              ram: tech.ram,
              dbEngine: tech.dbEngine,
              diskSize: tech.diskSize,
              storageType: tech.storageType,
              storageQuota: tech.storageQuota,
              createdBy: null,
            });

            results.push({
              key: jiraResponse.key,
              url: jiraResponse.url,
            });
          }

          return results;
        } catch (error) {
          console.error("Error creating multiple Jira tickets:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Erreur lors de la création des tickets Jira",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
