import type { GradeLevelId } from "./grade-level";
import type { UserProfile } from "./user-profile";
import type { UserHistory } from "./user-history";
import type { StoredActivityPayload } from "./user-activity";

export const USER_SYNC_VERSION = 2;

export type UserSyncPayload = {
  version: typeof USER_SYNC_VERSION;
  updatedAt: string;
  profile: UserProfile;
  activity: StoredActivityPayload;
  history: UserHistory;
  gradeLevel: GradeLevelId | null;
};

export function emptyUserSyncPayload(): UserSyncPayload {
  return {
    version: USER_SYNC_VERSION,
    updatedAt: new Date(0).toISOString(),
    profile: {},
    activity: { used: [], snapshots: {}, careerMap: null, analyzedKey: null },
    history: {
      testAttempts: [],
      translateHistory: [],
      chatSessions: [],
      practiceHistory: [],
    },
    gradeLevel: null,
  };
}
