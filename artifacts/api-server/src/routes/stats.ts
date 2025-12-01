import { Router, type IRouter } from "express";
import { eq, count, and, lt } from "drizzle-orm";
import { db, projectsTable, tasksTable, teamMembersTable, activityTable } from "@workspace/db";
import {
  GetDashboardStatsResponse,
  GetRecentActivityResponse,
  GetProjectBreakdownResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/dashboard", async (_req, res): Promise<void> => {
  const [totalProjects] = await db.select({ count: count() }).from(projectsTable);
  const [activeProjects] = await db.select({ count: count() }).from(projectsTable).where(eq(projectsTable.status, "active"));
  const [completedProjects] = await db.select({ count: count() }).from(projectsTable).where(eq(projectsTable.status, "completed"));
  const [totalTasks] = await db.select({ count: count() }).from(tasksTable);
  const [completedTasks] = await db.select({ count: count() }).from(tasksTable).where(eq(tasksTable.status, "done"));
  const [inProgressTasks] = await db.select({ count: count() }).from(tasksTable).where(eq(tasksTable.status, "in_progress"));
  const [teamSize] = await db.select({ count: count() }).from(teamMembersTable);

  const today = new Date().toISOString().split("T")[0];
  const [overdueTasks] = await db
    .select({ count: count() })
    .from(tasksTable)
    .where(and(lt(tasksTable.dueDate, today)));

  const total = totalTasks?.count ?? 0;
  const completed = completedTasks?.count ?? 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = {
    totalProjects: totalProjects?.count ?? 0,
    activeProjects: activeProjects?.count ?? 0,
    completedProjects: completedProjects?.count ?? 0,
    totalTasks: total,
    completedTasks: completed,
    inProgressTasks: inProgressTasks?.count ?? 0,
    overdueTasks: overdueTasks?.count ?? 0,
    teamSize: teamSize?.count ?? 0,
    completionRate,
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

router.get("/stats/activity", async (_req, res): Promise<void> => {
  const activity = await db
    .select()
    .from(activityTable)
    .orderBy(activityTable.createdAt)
    .limit(20);

  const serialized = activity.reverse().map((a) => ({
    ...a,
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
  }));

  res.json(GetRecentActivityResponse.parse(serialized));
});

router.get("/stats/projects/breakdown", async (_req, res): Promise<void> => {
  const [totalResult] = await db.select({ count: count() }).from(projectsTable);
  const total = totalResult?.count ?? 0;

  const statuses = ["planning", "active", "on_hold", "completed", "cancelled"];
  const breakdown = await Promise.all(
    statuses.map(async (status) => {
      const [result] = await db.select({ count: count() }).from(projectsTable).where(eq(projectsTable.status, status));
      const cnt = result?.count ?? 0;
      return {
        status,
        count: cnt,
        percentage: total > 0 ? Math.round((cnt / total) * 100) : 0,
      };
    })
  );

  res.json(GetProjectBreakdownResponse.parse(breakdown));
});

export default router;
