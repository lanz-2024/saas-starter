import { router } from './trpc';
import { projectsRouter } from './routers/projects';
import { teamsRouter } from './routers/teams';

export const appRouter = router({
  projects: projectsRouter,
  teams: teamsRouter,
});

export type AppRouter = typeof appRouter;
