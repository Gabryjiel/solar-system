import { Prisma } from "@prisma/client";
import { addDays, lightFormat } from "date-fns";
import { z } from "zod";

import { t } from "../trpc";

export const powerRouter = t.router({
  getPowerByDay: t.procedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = input.date.toJSON().slice(0, 10);
      const end = addDays(input.date, 1).toJSON().slice(0, 10);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: number;
        }[]
      >(
        Prisma.sql`select round(avg(power_now)) as value, hour(timestamp) as name from logs where timestamp > ${start} and timestamp < ${end} group by hour(timestamp)`
      );

      return result;
    }),
  getPowerByWeek: t.procedure
    .input(z.object({ startDate: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = input.startDate.toJSON().slice(0, 10);
      const end = addDays(input.startDate, 7).toJSON().slice(0, 10);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: Date;
        }[]
      >(
        Prisma.sql`select round(avg(power_now)) as value, date(timestamp) as name from logs where timestamp > ${start} and timestamp < ${end} group by date(timestamp)`
      );

      return result.map((item) => {
        return {
          value: item.value,
          name: lightFormat(item.name, "yyyy-MM-dd"),
        };
      });
    }),
  getPowerByMonth: t.procedure
    .input(z.object({ startDate: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = input.startDate.toJSON().slice(0, 10);
      const end = addDays(input.startDate, 7).toJSON().slice(0, 10);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: string;
        }[]
      >(
        Prisma.sql`select round(avg(power_now)) as value, DATE_FORMAT(timestamp,'%Y-%m') as name from logs where timestamp > ${start} and timestamp < ${end} group by DATE_FORMAT(timestamp,'%Y-%m')`
      );

      return result;
    }),
  getPowerByYear: t.procedure
    .input(z.object({ startDate: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = input.startDate.toJSON().slice(0, 10);
      const end = addDays(input.startDate, 7).toJSON().slice(0, 10);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: string;
        }[]
      >(
        Prisma.sql`select round(avg(power_now)) as value, year(timestamp) as name from logs where timestamp > ${start} and timestamp < ${end} group by year(timestamp)`
      );

      return result;
    }),
});
