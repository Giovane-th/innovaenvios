import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import * as correios from "./correios.js";
import * as db from "./db.js";
import * as authDb from "./auth-db.js";

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

    loginAppUser: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return authDb.loginAppUser(input.email, input.password);
      }),

    registerAppUser: publicProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return authDb.registerAppUser(input.name, input.email, input.password);
      }),

    listAppUsers: protectedProcedure.query(async () => {
      return authDb.listAppUsers();
    }),

    createAppUser: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string(),
          role: z.enum(['user', 'admin']).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return authDb.createAppUser(input.name, input.email, input.password, input.role);
      }),

    deleteAppUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        return authDb.deleteAppUser(input.userId);
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

  clients: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getClients(input?.limit, input?.offset);
      }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchClients(input.query);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getClientById(input.id);
      }),

    create: publicProcedure
      .input(z.object({
        nome: z.string(),
        email: z.string().optional(),
        cpf_cnpj: z.string().optional(),
        telefone: z.string().optional(),
        celular: z.string().optional(),
        endereco: z.string().optional(),
        numero: z.string().optional(),
        complemento: z.string().optional(),
        cidade: z.string().optional(),
        uf: z.string().optional(),
        bairro: z.string().optional(),
        cep: z.string().optional(),
        ponto_referencia: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createClient(input);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        email: z.string().optional(),
        cpf_cnpj: z.string().optional(),
        telefone: z.string().optional(),
        celular: z.string().optional(),
        endereco: z.string().optional(),
        numero: z.string().optional(),
        complemento: z.string().optional(),
        cidade: z.string().optional(),
        uf: z.string().optional(),
        bairro: z.string().optional(),
        cep: z.string().optional(),
        ponto_referencia: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateClient(id, data);
        return await db.getClientById(id);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteClient(input.id);
        return { success: true };
      }),
  }),

  shippingLabels: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getShippingLabels(input?.limit, input?.offset);
      }),

    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return await db.getShippingLabelByCode(input.code);
      }),

    create: publicProcedure
      .input(z.object({
        code: z.string(),
        clientId: z.number().optional(),
        recipient: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string(),
        number: z.string(),
        complement: z.string().optional(),
        city: z.string(),
        state: z.string(),
        neighborhood: z.string().optional(),
        zipcode: z.string(),
        reference_point: z.string().optional(),
        status: z.enum(["Gerada", "Postada", "Em trânsito", "Entregue"]).optional(),
        created_by: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.createShippingLabel(input);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["Gerada", "Postada", "Em trânsito", "Entregue"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateShippingLabel(id, data);
        return await db.getShippingLabelByCode("");
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteShippingLabel(input.id);
        return { success: true };
      }),
  }),
  employees: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getEmployees(input?.limit, input?.offset);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getEmployeeById(input.id);
      }),

    create: publicProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email(),
        role: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await db.createEmployee(input);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.string().optional(),
        password: z.string().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateEmployee(id, data);
        return await db.getEmployeeById(id);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEmployee(input.id);
        return { success: true };
      }),
  }),

  settings: router({
    get: publicProcedure
      .query(async () => {
        return await db.getSettings();
      }),

    update: publicProcedure
      .input(z.object({
        companyName: z.string().optional(),
        cnpj: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        correiosContract: z.string().optional(),
        correiosApiKey: z.string().optional(),
        correiosUser: z.string().optional(),
        correiosPassword: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        logoUrl: z.string().optional(),
        enableNotifications: z.number().optional(),
        enableAutoBackup: z.number().optional(),
        darkMode: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.updateSettings(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
