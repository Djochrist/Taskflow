import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, teamMembersTable, tasksTable, activityTable } from "@workspace/db";
import {
  ListTeamMembersResponse,
  ListTeamMembersResponseItem,
  CreateTeamMemberBody,
  UpdateTeamMemberParams,
  UpdateTeamMemberBody,
  UpdateTeamMemberResponse,
  DeleteTeamMemberParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/team", async (_req, res): Promise<void> => {
  const members = await db.select().from(teamMembersTable).orderBy(teamMembersTable.createdAt);

  const membersWithTaskCount = await Promise.all(
    members.map(async (member) => {
      const [taskCountResult] = await db
        .select({ count: count() })
        .from(tasksTable)
        .where(eq(tasksTable.assigneeId, member.id));
      return { ...member, taskCount: taskCountResult?.count ?? 0 };
    })
  );

  res.json(ListTeamMembersResponse.parse(membersWithTaskCount));
});

router.post("/team", async (req, res): Promise<void> => {
  const parsed = CreateTeamMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [member] = await db.insert(teamMembersTable).values(parsed.data).returning();

  await db.insert(activityTable).values({
    type: "member_added",
    description: `${member.name} joined the team as ${member.role}`,
    entityName: member.name,
    actorName: "Admin",
  });

  const result = ListTeamMembersResponseItem.parse({ ...member, taskCount: 0 });
  res.status(201).json(result);
});

router.patch("/team/:id", async (req, res): Promise<void> => {
  const params = UpdateTeamMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTeamMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [member] = await db
    .update(teamMembersTable)
    .set(parsed.data)
    .where(eq(teamMembersTable.id, params.data.id))
    .returning();

  if (!member) {
    res.status(404).json({ error: "Team member not found" });
    return;
  }

  const [taskCountResult] = await db
    .select({ count: count() })
    .from(tasksTable)
    .where(eq(tasksTable.assigneeId, member.id));

  res.json(UpdateTeamMemberResponse.parse({ ...member, taskCount: taskCountResult?.count ?? 0 }));
});

router.delete("/team/:id", async (req, res): Promise<void> => {
  const params = DeleteTeamMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [member] = await db.delete(teamMembersTable).where(eq(teamMembersTable.id, params.data.id)).returning();
  if (!member) {
    res.status(404).json({ error: "Team member not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
