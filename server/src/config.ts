function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const config = {
  host: process.env.HOST || "0.0.0.0",
  port: positiveInteger(process.env.PORT, 3001),
  databaseUrl: process.env.DATABASE_URL,
  databaseHost: process.env.PGHOST || "127.0.0.1",
  databasePort: positiveInteger(process.env.PGPORT, 5432),
  databaseName: process.env.PGDATABASE || "openvox",
  databaseUser: process.env.PGUSER || "openvox",
  databasePassword: process.env.PGPASSWORD || "openvox-local-change-me",
  cookieSecure: process.env.COOKIE_SECURE === "true",
  sessionDays: positiveInteger(process.env.SESSION_DAYS, 30),
};
