export type Route =
  | "splash"
  | "signin"
  | "signup"
  | "resetPassword"
  | "onboarding"
  | "terms"
  | "dashboard"
  | "aiCoach"
  | "tasks"
  | "goals"
  | "profile"
  | "settings"
  | "notifications"
  | "calendar"
  | "careerTrack";

export type TabRoute = "dashboard" | "aiCoach" | "tasks" | "goals" | "profile";

export type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  degreeProgram: string;
  studyYear: string;
  technicalSkillLevel: string;
  softSkillLevel: string;
  availabilityType: string;
  availabilityHours: string;
  joinedDate: string;
  goal: string;
  goalId?: number;
  technicalScore?: number;
  softSkillScore?: number;
  currentScore?: number;
  skillReadinessLabel?: string;
  recommendation?: string;
};

export type Message = {
  id: number;
  type: "user" | "aura";
  content: string;
  /** Omit when restoring history (DB has no per-message time). */
  timestamp?: string;
  category?: string;
};
