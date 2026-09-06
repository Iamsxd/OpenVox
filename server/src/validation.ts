export interface TrainingSessionPayload {
  id: string;
  projectId: string;
  exerciseId: string;
  exerciseName: string;
  category: string;
  difficulty: string;
  startedAt: number;
  completedAt: number;
  durationSeconds: number;
  updatedAt: number;
  [key: string]: unknown;
}

export interface PracticeGoalPayload {
  id: string;
  title: string;
  category: string;
  targetMinutesPerWeek: number;
  createdAt: number;
  active: boolean;
  updatedAt: number;
  [key: string]: unknown;
}

export interface SyncDeletionPayload {
  entityType: "trainingSession" | "practiceGoal";
  entityId: string;
  deletedAt: number;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isId(value: unknown) {
  return typeof value === "string" && value.length > 0 && value.length <= 200;
}

function isTimestamp(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export function isTrainingSession(
  value: unknown,
): value is TrainingSessionPayload {
  return (
    isObject(value) &&
    isId(value.id) &&
    isId(value.projectId) &&
    isId(value.exerciseId) &&
    typeof value.exerciseName === "string" &&
    value.exerciseName.length <= 300 &&
    typeof value.category === "string" &&
    typeof value.difficulty === "string" &&
    isTimestamp(value.startedAt) &&
    isTimestamp(value.completedAt) &&
    typeof value.durationSeconds === "number" &&
    Number.isFinite(value.durationSeconds) &&
    value.durationSeconds >= 0 &&
    isTimestamp(value.updatedAt)
  );
}

export function isPracticeGoal(value: unknown): value is PracticeGoalPayload {
  return (
    isObject(value) &&
    isId(value.id) &&
    typeof value.title === "string" &&
    value.title.length <= 300 &&
    typeof value.category === "string" &&
    typeof value.targetMinutesPerWeek === "number" &&
    Number.isFinite(value.targetMinutesPerWeek) &&
    value.targetMinutesPerWeek >= 0 &&
    isTimestamp(value.createdAt) &&
    typeof value.active === "boolean" &&
    isTimestamp(value.updatedAt)
  );
}

export function isSyncDeletion(value: unknown): value is SyncDeletionPayload {
  return (
    isObject(value) &&
    (value.entityType === "trainingSession" ||
      value.entityType === "practiceGoal") &&
    isId(value.entityId) &&
    isTimestamp(value.deletedAt)
  );
}

export function validateSyncBody(body: unknown) {
  if (!isObject(body)) return null;
  const sessions = Array.isArray(body.sessions) ? body.sessions : null;
  const goals = Array.isArray(body.goals) ? body.goals : null;
  const deletions = Array.isArray(body.deletions) ? body.deletions : null;
  if (!sessions || !goals || !deletions) return null;
  if (sessions.length > 5000 || goals.length > 1000 || deletions.length > 6000)
    return null;
  if (
    !sessions.every(isTrainingSession) ||
    !goals.every(isPracticeGoal) ||
    !deletions.every(isSyncDeletion)
  ) {
    return null;
  }
  return { sessions, goals, deletions };
}
