import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as correios from "./correios.js";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

  }),

  correios: router({
    autenticar: publicProcedure
      .input(
        z.object({
          cartaoPostagem: z.string(),
          contrato: z.string(),
          usuario: z.string(),
          senha: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const result = await correios.autenticarCorreios(input);
          return {
            success: true,
            token: result.token,
            dataVigenciaFim: result.dataVigenciaFim,
          };
        } catch (error) {
          throw new Error(
            `Erro ao autenticar: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }),

    buscarCEP: publicProcedure
      .input(
        z.object({
          token: z.string(),
          cep: z.string(),
        })
      )
      .query(async ({ input }) => {
        try {
          const result = await correios.buscarCEP(input.token, input.cep);
          return result;
        } catch (error) {
          throw new Error(
            `Erro ao buscar CEP: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }),

    solicitarPostal: publicProcedure
      .input(
        z.object({
          token: z.string(),
          cartaoPostagem: z.string(),
          dados: z.any(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const result = await correios.solicitarPostal(
            input.token,
            input.cartaoPostagem,
            input.dados
          );
          return result;
        } catch (error) {
          throw new Error(
            `Erro ao solicitar postal: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }),

    gerarEtiqueta: publicProcedure
      .input(
        z.object({
          token: z.string(),
          idPlpMaster: z.number(),
          sequencialPostal: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const result = await correios.gerarEtiqueta(
            input.token,
            input.idPlpMaster,
            input.sequencialPostal
          );
          return result;
        } catch (error) {
          throw new Error(
            `Erro ao gerar etiqueta: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
