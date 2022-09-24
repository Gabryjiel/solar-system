// src/server/router/index.ts
import { t } from "../trpc";
import { logsRouter } from "./logs";

export const appRouter = t.router({
  logs: logsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
