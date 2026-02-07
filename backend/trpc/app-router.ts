import { createTRPCRouter } from "./create-context";
import { b2Router } from "./routes/b2";

export const appRouter = createTRPCRouter({
  b2: b2Router,
});

export type AppRouter = typeof appRouter;
