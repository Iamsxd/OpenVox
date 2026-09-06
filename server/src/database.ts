import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

export const pool = new Pool({
  ...(config.databaseUrl
    ? { connectionString: config.databaseUrl }
    : {
        host: config.databaseHost,
        port: config.databasePort,
        database: config.databaseName,
        user: config.databaseUser,
        password: config.databasePassword,
      }),
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export async function migrateDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY,
      email text NOT NULL UNIQUE,
      display_name text NOT NULL,
      password_hash text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id uuid PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash text NOT NULL UNIQUE,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS auth_sessions_token_hash_idx ON auth_sessions(token_hash);
    CREATE INDEX IF NOT EXISTS auth_sessions_expires_at_idx ON auth_sessions(expires_at);

    CREATE TABLE IF NOT EXISTS training_sessions (
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      entity_id text NOT NULL,
      payload jsonb NOT NULL DEFAULT '{}'::jsonb,
      updated_at bigint NOT NULL,
      deleted_at bigint,
      PRIMARY KEY (user_id, entity_id)
    );

    CREATE INDEX IF NOT EXISTS training_sessions_user_updated_idx
      ON training_sessions(user_id, updated_at);

    CREATE TABLE IF NOT EXISTS practice_goals (
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      entity_id text NOT NULL,
      payload jsonb NOT NULL DEFAULT '{}'::jsonb,
      updated_at bigint NOT NULL,
      deleted_at bigint,
      PRIMARY KEY (user_id, entity_id)
    );

    CREATE INDEX IF NOT EXISTS practice_goals_user_updated_idx
      ON practice_goals(user_id, updated_at);
  `);
}
