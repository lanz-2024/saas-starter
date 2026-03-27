import { projectsRouter } from './routers/projects';
import { teamsRouter } from './routers/teams';
import { router } from './trpc';

export const appRouter = router({
  projects: projectsRouter,
  teams: teamsRouter,
});

export type AppRouter = typeof appRouter;
