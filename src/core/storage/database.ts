import type {
  AppSettings,
  OpenVoxProject,
  PracticeGoal,
  RecordingEntry,
  SyncDeletion,
  TrainingSessionEntry,
} from "../../types";
import { synchronizeNotePitch } from "../music/notes";

const DB_NAME = "openvox-studio";
const DB_VERSION = 4;
const PROJECTS = "projects";
const RECORDINGS = "recordings";
const SETTINGS = "settings";
const SESSIONS = "trainingSessions";
const GOALS = "practiceGoals";
const SYNC_DELETIONS = "syncDeletions";
const SYNC_METADATA = "syncMetadata";

export const TRAINING_CHANGED_EVENT = "openvox-training-changed";
export const TRAINING_SYNCED_EVENT = "openvox-training-synced";

function notifyTrainingChanged(eventName = TRAINING_CHANGED_EVENT) {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(eventName));
}

function sessionUpdatedAt(session: TrainingSessionEntry) {
  return session.updatedAt || session.completedAt || session.startedAt;
}

function goalUpdatedAt(goal: PracticeGoal) {
  return goal.updatedAt || goal.createdAt;
}

function normalizeProjectPitchData(project: OpenVoxProject): OpenVoxProject {
  return {
    ...project,
    score: {
      ...project.score,
      notes: project.score.notes.map(synchronizeNotePitch),
    },
  };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROJECTS))
        db.createObjectStore(PROJECTS, { keyPath: "id" });
      if (!db.objectStoreNames.contains(RECORDINGS)) {
        const store = db.createObjectStore(RECORDINGS, { keyPath: "id" });
        store.createIndex("projectId", "projectId", { unique: false });
      }
      if (!db.objectStoreNames.contains(SETTINGS))
        db.createObjectStore(SETTINGS, { keyPath: "key" });
      if (!db.objectStoreNames.contains(SESSIONS)) {
        const store = db.createObjectStore(SESSIONS, { keyPath: "id" });
        store.createIndex("projectId", "projectId", { unique: false });
        store.createIndex("startedAt", "startedAt", { unique: false });
        store.createIndex("category", "category", { unique: false });
      }
      if (!db.objectStoreNames.contains(GOALS))
        db.createObjectStore(GOALS, { keyPath: "id" });
      if (!db.objectStoreNames.contains(SYNC_DELETIONS)) {
        db.createObjectStore(SYNC_DELETIONS, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(SYNC_METADATA)) {
        db.createObjectStore(SYNC_METADATA, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("Unable to open local database."));
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("Local database operation failed."));
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error || new Error("Local database transaction failed."));
    tx.onabort = () =>
      reject(tx.error || new Error("Local database transaction was aborted."));
  });
}

export async function saveProject(project: OpenVoxProject): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(PROJECTS, "readwrite");
  tx.objectStore(PROJECTS).put(normalizeProjectPitchData(project));
  await transactionDone(tx);
  db.close();
}

export async function getProject(
  id: string,
): Promise<OpenVoxProject | undefined> {
  const db = await openDatabase();
  const tx = db.transaction(PROJECTS, "readonly");
  const result = await requestToPromise<OpenVoxProject | undefined>(
    tx.objectStore(PROJECTS).get(id),
  );
  db.close();
  return result ? normalizeProjectPitchData(result) : undefined;
}

export async function listProjects(): Promise<OpenVoxProject[]> {
  const db = await openDatabase();
  const tx = db.transaction(PROJECTS, "readonly");
  const result = await requestToPromise<OpenVoxProject[]>(
    tx.objectStore(PROJECTS).getAll(),
  );
  db.close();
  return result
    .map(normalizeProjectPitchData)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteProject(id: string): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(
    [PROJECTS, RECORDINGS, SESSIONS, SYNC_DELETIONS],
    "readwrite",
  );
  tx.objectStore(PROJECTS).delete(id);
  const recordings = tx.objectStore(RECORDINGS).index("projectId");
  const recordingKeys = await requestToPromise<IDBValidKey[]>(
    recordings.getAllKeys(id),
  );
  recordingKeys.forEach((key) => tx.objectStore(RECORDINGS).delete(key));
  const sessions = tx.objectStore(SESSIONS).index("projectId");
  const projectSessions = await requestToPromise<TrainingSessionEntry[]>(
    sessions.getAll(id),
  );
  const deletedAt = Date.now();
  projectSessions.forEach((session) => {
    tx.objectStore(SESSIONS).delete(session.id);
    tx.objectStore(SYNC_DELETIONS).put({
      key: `trainingSession:${session.id}`,
      entityType: "trainingSession",
      entityId: session.id,
      deletedAt,
    } satisfies SyncDeletion);
  });
  await transactionDone(tx);
  db.close();
  if (projectSessions.length) notifyTrainingChanged();
}

export async function saveRecording(recording: RecordingEntry): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(RECORDINGS, "readwrite");
  tx.objectStore(RECORDINGS).put(recording);
  await transactionDone(tx);
  db.close();
}
export async function deleteRecording(id: string): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(RECORDINGS, "readwrite");
  tx.objectStore(RECORDINGS).delete(id);
  await transactionDone(tx);
  db.close();
}
export async function listRecordings(
  projectId: string,
): Promise<RecordingEntry[]> {
  const db = await openDatabase();
  const tx = db.transaction(RECORDINGS, "readonly");
  const result = await requestToPromise<RecordingEntry[]>(
    tx.objectStore(RECORDINGS).index("projectId").getAll(projectId),
  );
  db.close();
  return result.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveTrainingSession(
  session: TrainingSessionEntry,
): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(SESSIONS, "readwrite");
  tx.objectStore(SESSIONS).put({
    ...session,
    updatedAt: sessionUpdatedAt(session),
  });
  await transactionDone(tx);
  db.close();
  notifyTrainingChanged();
}
export async function listTrainingSessions(
  projectId?: string,
): Promise<TrainingSessionEntry[]> {
  const db = await openDatabase();
  const tx = db.transaction(SESSIONS, "readonly");
  const store = tx.objectStore(SESSIONS);
  const result = projectId
    ? await requestToPromise<TrainingSessionEntry[]>(
        store.index("projectId").getAll(projectId),
      )
    : await requestToPromise<TrainingSessionEntry[]>(store.getAll());
  db.close();
  return result.sort((a, b) => b.startedAt - a.startedAt);
}
export async function deleteTrainingSession(id: string): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction([SESSIONS, SYNC_DELETIONS], "readwrite");
  tx.objectStore(SESSIONS).delete(id);
  tx.objectStore(SYNC_DELETIONS).put({
    key: `trainingSession:${id}`,
    entityType: "trainingSession",
    entityId: id,
    deletedAt: Date.now(),
  } satisfies SyncDeletion);
  await transactionDone(tx);
  db.close();
  notifyTrainingChanged();
}

export async function savePracticeGoal(goal: PracticeGoal): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(GOALS, "readwrite");
  tx.objectStore(GOALS).put({ ...goal, updatedAt: Date.now() });
  await transactionDone(tx);
  db.close();
  notifyTrainingChanged();
}
export async function listPracticeGoals(): Promise<PracticeGoal[]> {
  const db = await openDatabase();
  const tx = db.transaction(GOALS, "readonly");
  const result = await requestToPromise<PracticeGoal[]>(
    tx.objectStore(GOALS).getAll(),
  );
  db.close();
  return result.sort((a, b) => b.createdAt - a.createdAt);
}
export async function deletePracticeGoal(id: string): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction([GOALS, SYNC_DELETIONS], "readwrite");
  tx.objectStore(GOALS).delete(id);
  tx.objectStore(SYNC_DELETIONS).put({
    key: `practiceGoal:${id}`,
    entityType: "practiceGoal",
    entityId: id,
    deletedAt: Date.now(),
  } satisfies SyncDeletion);
  await transactionDone(tx);
  db.close();
  notifyTrainingChanged();
}

export async function listSyncDeletions(): Promise<SyncDeletion[]> {
  const db = await openDatabase();
  const tx = db.transaction(SYNC_DELETIONS, "readonly");
  const result = await requestToPromise<SyncDeletion[]>(
    tx.objectStore(SYNC_DELETIONS).getAll(),
  );
  db.close();
  return result;
}

export async function claimTrainingSyncOwner(userId: string): Promise<boolean> {
  const db = await openDatabase();
  const tx = db.transaction(SYNC_METADATA, "readwrite");
  const store = tx.objectStore(SYNC_METADATA);
  const current = await requestToPromise<
    { key: string; value: string } | undefined
  >(store.get("trainingOwner"));
  if (!current) store.put({ key: "trainingOwner", value: userId });
  await transactionDone(tx);
  db.close();
  return !current || current.value === userId;
}

export async function applyTrainingSyncSnapshot(
  sessions: TrainingSessionEntry[],
  goals: PracticeGoal[],
  deletions: Omit<SyncDeletion, "key">[],
  acknowledgedDeletions: SyncDeletion[],
): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction([SESSIONS, GOALS, SYNC_DELETIONS], "readwrite");
  const sessionStore = tx.objectStore(SESSIONS);
  const goalStore = tx.objectStore(GOALS);
  const deletionStore = tx.objectStore(SYNC_DELETIONS);
  const sessionRequest = sessionStore.getAll();
  const goalRequest = goalStore.getAll();
  const deletionRequest = deletionStore.getAll();
  const [localSessions, localGoals, pendingDeletions] = await Promise.all([
    requestToPromise<TrainingSessionEntry[]>(sessionRequest),
    requestToPromise<PracticeGoal[]>(goalRequest),
    requestToPromise<SyncDeletion[]>(deletionRequest),
  ]);
  const sessionMap = new Map(
    localSessions.map((session) => [session.id, session]),
  );
  const goalMap = new Map(localGoals.map((goal) => [goal.id, goal]));

  sessions.forEach((session) => {
    const local = sessionMap.get(session.id);
    if (!local || sessionUpdatedAt(session) >= sessionUpdatedAt(local))
      sessionStore.put(session);
  });
  goals.forEach((goal) => {
    const local = goalMap.get(goal.id);
    if (!local || goalUpdatedAt(goal) >= goalUpdatedAt(local))
      goalStore.put(goal);
  });
  deletions.forEach((deletion) => {
    if (deletion.entityType === "trainingSession") {
      const local = sessionMap.get(deletion.entityId);
      if (!local || deletion.deletedAt >= sessionUpdatedAt(local))
        sessionStore.delete(deletion.entityId);
    } else {
      const local = goalMap.get(deletion.entityId);
      if (!local || deletion.deletedAt >= goalUpdatedAt(local))
        goalStore.delete(deletion.entityId);
    }
  });

  const acknowledgedMap = new Map(
    acknowledgedDeletions.map((item) => [item.key, item.deletedAt]),
  );
  pendingDeletions.forEach((item) => {
    const acknowledgedAt = acknowledgedMap.get(item.key);
    if (acknowledgedAt !== undefined && item.deletedAt <= acknowledgedAt)
      deletionStore.delete(item.key);
  });
  await transactionDone(tx);
  db.close();
  notifyTrainingChanged(TRAINING_SYNCED_EVENT);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(SETTINGS, "readwrite");
  tx.objectStore(SETTINGS).put({ key: "app", value: settings });
  await transactionDone(tx);
  db.close();
}
export async function loadSettings(): Promise<AppSettings | undefined> {
  const db = await openDatabase();
  const tx = db.transaction(SETTINGS, "readonly");
  const result = await requestToPromise<
    { key: string; value: AppSettings } | undefined
  >(tx.objectStore(SETTINGS).get("app"));
  db.close();
  return result?.value;
}
