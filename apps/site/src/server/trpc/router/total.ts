import { Prisma } from "@prisma/client";
import { addDays, lightFormat } from "date-fns";
import { z } from "zod";

import { t } from "../trpc";

export const totalRouter = t.router({
  byHour: t.procedure
    .input(z.object({ start: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = input.start.toJSON().slice(0, 10);
      const end = addDays(input.start, 1).toJSON().slice(0, 10);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: number;
        }[]
      >(
        Prisma.sql`select round(max(energy_total)) as value, hour(timestamp) as name from logs where timestamp > ${start} and timestamp < ${end} group by hour(timestamp)`
      );

      return result;
    }),
  byDay: t.procedure
    .input(z.object({ start: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = input.start.toJSON().slice(0, 10);
      const end = addDays(input.start, 7).toJSON().slice(0, 10);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          date: Date;
        }[]
      >(
        Prisma.sql`select round(max(energy_total)) as value, date(timestamp) as name from logs where timestamp > ${start} and timestamp < ${end} group by date(timestamp)`
      );

      return result.map((item) => {
        return {
          value: item.value,
          name: lightFormat(item.date, "yyyy-MM-dd"),
        };
      });
    }),
  byWeek: t.procedure
    .input(z.object({ start: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = input.start.toJSON().slice(0, 10);
      const end = addDays(input.start, 28).toJSON().slice(0, 10);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: number;
        }[]
      >(
        Prisma.sql`select round(max(energy_total)) as value, week(timestamp) as name from logs where timestamp > ${start} and timestamp < ${end} group by week(timestamp)`
      );

      return result.map((item) => {
        return {
          value: item.value,
          name: item.name,
        };
      });
    }),
  byMonth: t.procedure
    .input(z.object({ start: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = input.start.toJSON().slice(0, 10);
      const end = addDays(input.start, 7).toJSON().slice(0, 10);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: string;
        }[]
      >(
        Prisma.sql`select round(max(energy_total)) as value, DATE_FORMAT(timestamp,'%Y-%m') as name from logs where timestamp > ${start} and timestamp < ${end} group by DATE_FORMAT(timestamp,'%Y-%m')`
      );

      return result;
    }),
  byQuarter: t.procedure
    .input(z.object({ start: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = input.start.toJSON().slice(0, 10);
      const end = addDays(input.start, 7).toJSON().slice(0, 10);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: string;
        }[]
      >(
        Prisma.sql`select round(max(energy_total)) as value, DATE_FORMAT(timestamp,'%Y-%m') as name from logs where timestamp > ${start} and timestamp < ${end} group by DATE_FORMAT(timestamp,'%Y-%m')`
      );

      return result;
    }),
  byYear: t.procedure
    .input(z.object({ start: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = input.start.toJSON().slice(0, 10);
      const end = addDays(input.start, 7).toJSON().slice(0, 10);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: string;
        }[]
      >(
        Prisma.sql`select round(max(energy_total)) as value, year(timestamp) as name from logs where timestamp > ${start} and timestamp < ${end} group by year(timestamp)`
      );

      return result;
    }),
});
