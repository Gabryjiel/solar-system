import { t } from "../trpc";
import { z } from "zod";

import { db } from '../../../utils/db';

export const exampleRouter = t.router({
  hello: t.procedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(async ({ input }) => {
      const result = await db.selectFrom('logs').selectAll().limit(10).execute();

      return {
        greeting: `Hello ${input?.text ?? "world"}`,
        result,
      };
    }),
});
