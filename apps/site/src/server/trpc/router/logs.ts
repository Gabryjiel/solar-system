import { Prisma } from "@prisma/client";
import { addDays } from "date-fns";
import { z } from "zod";

import { t } from "../trpc";

export const logsRouter = t.router({
  getNow: t.procedure.query(async ({ ctx }) => {
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
  getPowerByDay: t.procedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = input.date.toJSON().slice(0, 10);
      const end = addDays(input.date, 1).toJSON().slice(0, 10);

      const result = await ctx.prisma.$queryRaw<
        {
          average: number;
          hour: number;
        }[]
      >(
        Prisma.sql`select round(avg(power_now)) as average, hour(timestamp) as hour from logs where timestamp > ${start} and timestamp < ${end} group by hour(timestamp)`
      );

      return result;
    }),
});
