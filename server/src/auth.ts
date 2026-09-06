import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import type { FastifyReply, FastifyRequest } from "fastify";
import { config } from "./config.js";
import { pool } from "./database.js";

const scryptAsync = promisify(scrypt);
const SESSION_COOKIE = "openvox_session";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt.toString("base64url")}:${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, encodedSalt, encodedHash] = stored.split(":");
  const validEncoding =
    algorithm === "scrypt" && Boolean(encodedSalt) && Boolean(encodedHash);
  const salt = validEncoding
    ? Buffer.from(encodedSalt!, "base64url")
    : Buffer.alloc(16);
  const expected = validEncoding
    ? Buffer.from(encodedHash!, "base64url")
    : Buffer.alloc(64);
  const actual = (await scryptAsync(password, salt, expected.length)) as Buffer;
  return (
    validEncoding &&
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

export async function createSession(userId: string, reply: FastifyReply) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + config.sessionDays * 24 * 60 * 60 * 1000,
  );
  await pool.query(
    "INSERT INTO auth_sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)",
    [randomUUID(), userId, tokenHash(token), expiresAt],
  );
  reply.setCookie(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: config.cookieSecure,
    maxAge: config.sessionDays * 24 * 60 * 60,
  });
}

export async function clearSession(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const token = request.cookies[SESSION_COOKIE];
  if (token)
    await pool.query("DELETE FROM auth_sessions WHERE token_hash = $1", [
      tokenHash(token),
    ]);
  reply.clearCookie(SESSION_COOKIE, { path: "/" });
}

export async function currentUser(
  request: FastifyRequest,
): Promise<AuthUser | null> {
  const token = request.cookies[SESSION_COOKIE];
  if (!token) return null;
  const result = await pool.query<{
    id: string;
    email: string;
    display_name: string;
  }>(
    `SELECT users.id, users.email, users.display_name
       FROM auth_sessions
       JOIN users ON users.id = auth_sessions.user_id
      WHERE auth_sessions.token_hash = $1 AND auth_sessions.expires_at > now()`,
    [tokenHash(token)],
  );
  const row = result.rows[0];
  return row
    ? { id: row.id, email: row.email, displayName: row.display_name }
    : null;
}

export async function requireUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user = await currentUser(request);
  if (!user) {
    await reply.code(401).send({ error: "Authentication required." });
    return null;
  }
  return user;
}
