import type { AppRole, Database } from "@/types/database";

export type UserProfile = Database["public"]["Tables"]["users"]["Row"];

export interface AuthSessionProfile {
  profile: UserProfile;
  role: AppRole;
}
