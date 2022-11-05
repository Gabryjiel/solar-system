import { z } from "zod";

import { t } from "../trpc";

export const logsRouter = t.router({
  getNow: t.procedure
    .input(z.object({ date: z.date().optional() }))
    .query(async ({ ctx }) => {
      const result = await ctx.prisma.logs.findFirst({
        orderBy: {
          timestamp: "desc",
        },
      });

      return result;
    }),
  getLast10: t.procedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.logs.findMany({
      orderBy: {
        timestamp: "desc",
      },
      take: 10,
    });

    return result;
  }),
});
