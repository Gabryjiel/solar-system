import { Prisma } from "@prisma/client";
import { addDays, lightFormat } from "date-fns";
import { z } from "zod";

import { t } from "../trpc";

export const deltaRouter = t.router({
  getEnergyByDay: t.procedure
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
        Prisma.sql`select round(max(energy_today), 2) as value, hour(timestamp) as name from logs where timestamp > ${start} and timestamp < ${end} group by hour(timestamp)`
      );

      return result;
    }),
  getEnergyByWeek: t.procedure
    .input(z.object({ startDate: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = input.startDate.toJSON().slice(0, 10);
      const end = addDays(input.startDate, 7).toJSON().slice(0, 10);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          date: Date;
        }[]
      >(
        Prisma.sql`select round(max(energy_today), 2) as value, date(timestamp) as name from logs where timestamp > ${start} and timestamp < ${end} group by date(timestamp)`
      );

      return result.map((item) => {
        return {
          value: item.value,
          name: lightFormat(item.date, "yyyy-MM-dd"),
        };
      });
    }),
  getEnergyByMonth: t.procedure
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
        Prisma.sql`select round(max(energy_today), 2) as value, DATE_FORMAT(timestamp,'%Y-%m') as name from logs where timestamp > ${start} and timestamp < ${end} group by DATE_FORMAT(timestamp,'%Y-%m')`
      );

      return result;
    }),
  getEnergyByYear: t.procedure
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
        Prisma.sql`select round(max(energy_today), 2) as value, year(timestamp) as name from logs where timestamp > ${start} and timestamp < ${end} group by year(timestamp)`
      );

      return result;
    }),
});
