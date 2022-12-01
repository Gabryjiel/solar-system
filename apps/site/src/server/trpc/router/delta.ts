import { Prisma } from "@prisma/client";
import {
  addDays,
  endOfMonth,
  endOfYear,
  lightFormat,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { z } from "zod";

import { t } from "../trpc";

export const deltaRouter = t.router({
  byHour: t.procedure
    .input(z.object({ startDate: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = input.startDate.toJSON().slice(0, 10);
      const end = addDays(input.startDate, 1).toJSON().slice(0, 10);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: number;
        }[]
      >(
        Prisma.sql`
          select 
            round(max(energy_today)) as value,
            hour(timestamp) as name
          from
            logs
          where
            timestamp > ${start}
            and timestamp < ${end}
          group by 
            hour(timestamp)`
      );

      return result;
    }),
  byDay: t.procedure
    .input(z.object({ startDate: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = startOfMonth(input.startDate);
      const end = endOfMonth(input.startDate);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: Date;
        }[]
      >(
        Prisma.sql`
          select
            max(energy_today) as value,
            date(timestamp) as name
          from
            logs
          where
            timestamp > ${start}
            and timestamp < ${end}
          group by
            date(timestamp)`
      );

      return result.map((item) => {
        return {
          value: item.value,
          name: lightFormat(item.name, "dd.MM"),
        };
      });
    }),
  byWeek: t.procedure
    .input(z.object({ startDate: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = startOfMonth(input.startDate);
      const end = endOfMonth(input.startDate);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: number;
        }[]
      >(
        Prisma.sql`
          select
            round(max(energy_today)) as value,
            week(timestamp) as name
          from
            logs
          where
            timestamp > ${start}
            and timestamp < ${end}
          group by
            week(timestamp)`
      );

      return result;
    }),
  byMonth: t.procedure
    .input(z.object({ startDate: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = startOfYear(input.startDate);
      const end = endOfYear(input.startDate);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: string;
        }[]
      >(
        Prisma.sql`
          select
            round(max(energy_today)) as value,
            DATE_FORMAT(timestamp,'%Y-%m') as name
          from
            logs
          where
            timestamp > ${start}
            and timestamp < ${end}
          group by
            DATE_FORMAT(timestamp,'%Y-%m')`
      );

      return result.map((item) => {
        return {
          value: item.value,
          name: item.name.slice(5),
        };
      });
    }),
  byQuarter: t.procedure
    .input(z.object({ startDate: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = startOfYear(input.startDate);
      const end = endOfYear(input.startDate);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: string;
        }[]
      >(
        Prisma.sql`
          select
            round(max(energy_today)) as value,
            DATE_FORMAT(timestamp,'%Y-%m') as name
          from
            logs
          where
            timestamp > ${start}
            and timestamp < ${end}
          group by
            DATE_FORMAT(timestamp,'%Y-%m')`
      );

      return result;
    }),
  byYear: t.procedure
    .input(z.object({ startDate: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = startOfYear(input.startDate);
      const end = endOfYear(input.startDate);

      const result = await ctx.prisma.$queryRaw<
        {
          value: number;
          name: string;
        }[]
      >(
        Prisma.sql`
          select
            round(max(energy_today)) as value,
            year(timestamp) as name
          from
            logs
          where
            timestamp > ${start}
            and timestamp < ${end}
          group by
            year(timestamp)`
      );

      return result;
    }),
});
