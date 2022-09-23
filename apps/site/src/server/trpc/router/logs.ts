import { t } from "../trpc";

import { db } from '../../../utils/db';

export const logsRouter = t.router({
  getLast10: t.procedure
    .query(async () => {
      const result = await db.selectFrom('logs').selectAll().limit(10).execute();

      return {
        result,
      };
    }),
});
