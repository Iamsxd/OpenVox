import type {
  PracticeGoal,
  SyncDeletion,
  TrainingSessionEntry,
} from "../../types";
import { apiRequest } from "../api/client";
import {
  applyTrainingSyncSnapshot,
  claimTrainingSyncOwner,
  listPracticeGoals,
  listSyncDeletions,
  listTrainingSessions,
} from "../storage/database";

interface TrainingSyncResponse {
  sessions: TrainingSessionEntry[];
  goals: PracticeGoal[];
  deletions: Omit<SyncDeletion, "key">[];
  syncedAt: number;
}

export class TrainingSyncOwnerError extends Error {
  constructor() {
    super("Local training data is already associated with another account.");
    this.name = "TrainingSyncOwnerError";
  }
}

function prepareSession(
  session: TrainingSessionEntry,
): TrainingSessionEntry & { updatedAt: number } {
  return {
    ...session,
    updatedAt: session.updatedAt || session.completedAt || session.startedAt,
  };
}

function prepareGoal(goal: PracticeGoal): PracticeGoal & { updatedAt: number } {
  return {
    ...goal,
    updatedAt: goal.updatedAt || goal.createdAt,
  };
}

export async function syncTrainingData(userId: string) {
  if (!(await claimTrainingSyncOwner(userId)))
    throw new TrainingSyncOwnerError();
  const [localSessions, localGoals, localDeletions] = await Promise.all([
    listTrainingSessions(),
    listPracticeGoals(),
    listSyncDeletions(),
  ]);
  const result = await apiRequest<TrainingSyncResponse>("/sync/training", {
    method: "POST",
    body: JSON.stringify({
      sessions: localSessions.map(prepareSession),
      goals: localGoals.map(prepareGoal),
      deletions: localDeletions.map(({ entityType, entityId, deletedAt }) => ({
        entityType,
        entityId,
        deletedAt,
      })),
    }),
  });
  await applyTrainingSyncSnapshot(
    result.sessions,
    result.goals,
    result.deletions,
    localDeletions,
  );
  return result;
}
