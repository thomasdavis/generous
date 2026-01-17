import { z } from "zod";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: "ok" };
  }),
  hello: publicProcedure.input(z.object({ name: z.string() })).query(({ input }) => {
    return { greeting: `Hello, ${input.name}!` };
  }),
});

export type AppRouter = typeof appRouter;
