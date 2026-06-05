import type { UserHistory } from "./user-history";
import type { UserProfile } from "./user-profile";
import type { StoredActivityPayload } from "./user-activity";

export type SyncDataCounts = {
  testAttempts: number;
  chatSessions: number;
  translateHistory: number;
  practiceHistory: number;
  hasProfile: boolean;
  hasHolland: boolean;
  hasTargetCareer: boolean;
  featuresUsed: number;
};

export function countSyncData(
  profile: UserProfile,
  history: UserHistory,
  activity: StoredActivityPayload,
): SyncDataCounts {
  return {
    testAttempts: history.testAttempts.length,
    chatSessions: history.chatSessions.length,
    translateHistory: history.translateHistory.length,
    practiceHistory: history.practiceHistory.length,
    hasProfile: Boolean(profile.testCompletedAt || profile.displayName),
    hasHolland: Boolean(profile.hollandResult?.hollandCode),
    hasTargetCareer: Boolean(profile.targetCareer?.id),
    featuresUsed: activity.used.length,
  };
}

export type SyncMeta = {
  lastSyncedAt: string | null;
  lastSyncDevice: string | null;
  pendingOffline: boolean;
  storageBackend: "blob" | "file" | "memory";
};

export const OFFLINE_QUEUE_KEY = "lexa-sync-offline-queue";
export const CACHE_PREFIX = "lexa-cache";
