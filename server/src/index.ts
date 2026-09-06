import { randomUUID } from "node:crypto";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import {
  clearSession,
  createSession,
  currentUser,
  hashPassword,
  normalizeEmail,
  requireUser,
  verifyPassword,
} from "./auth.js";
import { config } from "./config.js";
import { migrateDatabase, pool } from "./database.js";
import { validateSyncBody } from "./validation.js";

const app = Fastify({ logger: true, bodyLimit: 2 * 1024 * 1024 });

await app.register(cookie);
await app.register(rateLimit, { max: 180, timeWindow: "1 minute" });

app.get("/api/health", async () => {
  await pool.query("SELECT 1");
  return { status: "ok" };
});

app.get("/api/auth/me", async (request, reply) => {
  const user = await currentUser(request);
  if (!user) return reply.code(401).send({ error: "Authentication required." });
  return { user };
});

app.post(
  "/api/auth/register",
  { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } },
  async (request, reply) => {
    const body = request.body as {
      email?: unknown;
      password?: unknown;
      displayName?: unknown;
    };
    const email =
      typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const displayName =
      typeof body?.displayName === "string" ? body.displayName.trim() : "";
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return reply.code(400).send({ error: "Enter a valid email address." });
    }
    if (password.length < 10 || password.length > 200) {
      return reply
        .code(400)
        .send({ error: "Password must contain 10 to 200 characters." });
    }
    if (!displayName || displayName.length > 80) {
      return reply
        .code(400)
        .send({ error: "Display name must contain 1 to 80 characters." });
    }

    const id = randomUUID();
    try {
      await pool.query(
        "INSERT INTO users (id, email, display_name, password_hash) VALUES ($1, $2, $3, $4)",
        [id, email, displayName, await hashPassword(password)],
      );
    } catch (error) {
      if ((error as { code?: string }).code === "23505") {
        return reply
          .code(409)
          .send({ error: "An account with this email already exists." });
      }
      throw error;
    }
    await createSession(id, reply);
    return reply.code(201).send({ user: { id, email, displayName } });
  },
);

app.post(
  "/api/auth/login",
  { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
  async (request, reply) => {
    const body = request.body as { email?: unknown; password?: unknown };
    const email =
      typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const result = await pool.query<{
      id: string;
      email: string;
      display_name: string;
      password_hash: string;
    }>(
      "SELECT id, email, display_name, password_hash FROM users WHERE email = $1",
      [email],
    );
    const row = result.rows[0];
    const passwordMatches = await verifyPassword(
      password,
      row?.password_hash || "invalid",
    );
    if (!row || !passwordMatches) {
      return reply.code(401).send({ error: "Email or password is incorrect." });
    }
    await createSession(row.id, reply);
    return {
      user: { id: row.id, email: row.email, displayName: row.display_name },
    };
  },
);

app.post("/api/auth/logout", async (request, reply) => {
  await clearSession(request, reply);
  return reply.code(204).send();
});

app.post("/api/sync/training", async (request, reply) => {
  const user = await requireUser(request, reply);
  if (!user) return;
  const body = validateSyncBody(request.body);
  if (!body)
    return reply.code(400).send({ error: "Invalid training sync payload." });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const session of body.sessions) {
      await client.query(
        `INSERT INTO training_sessions (user_id, entity_id, payload, updated_at, deleted_at)
         VALUES ($1, $2, $3, $4, NULL)
         ON CONFLICT (user_id, entity_id) DO UPDATE
           SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at, deleted_at = NULL
         WHERE EXCLUDED.updated_at > training_sessions.updated_at`,
        [user.id, session.id, JSON.stringify(session), session.updatedAt],
      );
    }
    for (const goal of body.goals) {
      await client.query(
        `INSERT INTO practice_goals (user_id, entity_id, payload, updated_at, deleted_at)
         VALUES ($1, $2, $3, $4, NULL)
         ON CONFLICT (user_id, entity_id) DO UPDATE
           SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at, deleted_at = NULL
         WHERE EXCLUDED.updated_at > practice_goals.updated_at`,
        [user.id, goal.id, JSON.stringify(goal), goal.updatedAt],
      );
    }
    for (const deletion of body.deletions) {
      const table =
        deletion.entityType === "trainingSession"
          ? "training_sessions"
          : "practice_goals";
      await client.query(
        `INSERT INTO ${table} (user_id, entity_id, payload, updated_at, deleted_at)
         VALUES ($1, $2, '{}'::jsonb, $3, $3)
         ON CONFLICT (user_id, entity_id) DO UPDATE
           SET payload = '{}'::jsonb, updated_at = EXCLUDED.updated_at, deleted_at = EXCLUDED.deleted_at
         WHERE EXCLUDED.updated_at >= ${table}.updated_at`,
        [user.id, deletion.entityId, deletion.deletedAt],
      );
    }

    const [sessionRows, goalRows] = await Promise.all([
      client.query<{
        entity_id: string;
        payload: Record<string, unknown>;
        updated_at: string;
        deleted_at: string | null;
      }>(
        "SELECT entity_id, payload, updated_at, deleted_at FROM training_sessions WHERE user_id = $1",
        [user.id],
      ),
      client.query<{
        entity_id: string;
        payload: Record<string, unknown>;
        updated_at: string;
        deleted_at: string | null;
      }>(
        "SELECT entity_id, payload, updated_at, deleted_at FROM practice_goals WHERE user_id = $1",
        [user.id],
      ),
    ]);
    await client.query("COMMIT");

    const sessions = sessionRows.rows
      .filter((row) => row.deleted_at === null)
      .map((row) => ({
        ...row.payload,
        id: row.entity_id,
        updatedAt: Number(row.updated_at),
      }));
    const goals = goalRows.rows
      .filter((row) => row.deleted_at === null)
      .map((row) => ({
        ...row.payload,
        id: row.entity_id,
        updatedAt: Number(row.updated_at),
      }));
    const deletions = [
      ...sessionRows.rows
        .filter((row) => row.deleted_at !== null)
        .map((row) => ({
          entityType: "trainingSession" as const,
          entityId: row.entity_id,
          deletedAt: Number(row.deleted_at),
        })),
      ...goalRows.rows
        .filter((row) => row.deleted_at !== null)
        .map((row) => ({
          entityType: "practiceGoal" as const,
          entityId: row.entity_id,
          deletedAt: Number(row.deleted_at),
        })),
    ];
    return { sessions, goals, deletions, syncedAt: Date.now() };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

app.addHook("onClose", async () => {
  await pool.end();
});

await migrateDatabase();
await pool.query("DELETE FROM auth_sessions WHERE expires_at <= now()");
await app.listen({ host: config.host, port: config.port });
