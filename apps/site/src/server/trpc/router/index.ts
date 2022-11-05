// src/server/router/index.ts
import { t } from "../trpc";
import { deltaRouter } from "./delta";
import { logsRouter } from "./logs";
import { powerRouter } from "./power";
import { totalRouter } from "./total";

export const appRouter = t.router({
  logs: logsRouter,
  power: powerRouter,
  delta: deltaRouter,
  total: totalRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
